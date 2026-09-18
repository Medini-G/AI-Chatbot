const user = Session.current();
const listEl = document.getElementById('bookingsList');

if (!user) {
  window.location.href = 'login.html?next=my-bookings.html';
} else {
  renderBookings();
}

function renderBookings() {
  const bookings = Bookings.forUser(user.id).sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

  if (!bookings.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        <h3>No bookings yet</h3>
        <p>Once you book a ticket, it'll show up here.</p>
        <a href="events.html" class="btn btn-primary" style="margin-top:16px;">Browse events</a>
      </div>`;
    return;
  }

  listEl.innerHTML = bookings.map((b) => {
    const past = isPastEvent(b.eventDate);
    return `
      <div class="booking-card">
        <div>
          <h3 style="margin-bottom:4px;">${b.eventTitle}</h3>
          <div class="ticket-meta">
            <span>📅 ${formatDate(b.eventDate)} · ${b.eventTime}</span>
            <span>📍 ${b.eventLocation}</span>
          </div>
          <span class="code">Booking ID: ${b.id.toUpperCase()}</span>
        </div>
        <div style="text-align:right;">
          <div class="ticket-price">${formatPrice(b.totalPaid)}</div>
          <div class="ticket-seats">${b.tickets} ticket${b.tickets > 1 ? 's' : ''}</div>
          ${past
            ? `<span class="badge badge-ok" style="margin-top:8px; display:inline-block;">Completed</span>`
            : `<button class="btn btn-danger btn-sm" style="margin-top:8px;" data-id="${b.id}" data-event="${b.eventId}" data-qty="${b.tickets}">Cancel</button>`
          }
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => cancelBooking(btn.dataset.id, btn.dataset.event, Number(btn.dataset.qty)));
  });
}

function cancelBooking(bookingId, eventId, qty) {
  if (!confirm('Cancel this booking? This cannot be undone.')) return;
  Bookings.remove(bookingId);
  const ev = Events.byId(eventId);
  if (ev) Events.update(eventId, { seatsAvailable: ev.seatsAvailable + qty });
  toast('Booking cancelled.');
  renderBookings();
}
