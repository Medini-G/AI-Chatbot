const root = document.getElementById('detailsRoot');
const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');
const event = eventId ? Events.byId(eventId) : null;

if (!event) {
  root.innerHTML = `<div class="empty-state"><h3>Event not found</h3><p>It may have been removed.</p><a href="events.html" class="btn btn-primary" style="margin-top:16px;">Back to events</a></div>`;
} else {
  render();
}

function render() {
  const past = isPastEvent(event.date);
  const soldOut = event.seatsAvailable <= 0;
  const seatsLow = !soldOut && event.seatsAvailable <= event.seatsTotal * 0.15;

  root.innerHTML = `
    <div class="grid-2">
      <div>
        <div class="ticket-image" style="background-image:url('${event.image}'); height:320px; border-radius:10px; position:relative;">
          <span class="ticket-category">${event.category}</span>
        </div>
        <h1 style="margin-top:24px; font-size: clamp(2rem, 4vw, 2.8rem);">${event.title}</h1>
        <div class="ticket-meta" style="font-size:0.88rem; margin-bottom:18px;">
          <span>📅 ${formatDate(event.date)} · ${event.time}</span>
          <span>📍 ${event.location}</span>
        </div>
        <p style="max-width:560px;">${event.description}</p>
      </div>

      <div>
        <div class="form-card" style="max-width:100%;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <span class="ticket-price" style="font-size:1.6rem;">${formatPrice(event.price)}</span>
            <span class="ticket-seats ${seatsLow ? 'low' : ''}">${past ? 'Event ended' : soldOut ? 'Sold out' : event.seatsAvailable + ' seats left'}</span>
          </div>

          ${past ? `
            <p>This event has already taken place.</p>
          ` : soldOut ? `
            <p>All seats for this event have been booked.</p>
          ` : `
            <div class="field">
              <label for="qty">Number of tickets</label>
              <input type="number" id="qty" min="1" max="${event.seatsAvailable}" value="1">
              <span class="field-error" id="qtyError">Enter a number between 1 and ${event.seatsAvailable}.</span>
            </div>
            <div id="totalLine" style="display:flex; justify-content:space-between; font-family:var(--font-mono); margin:16px 0; font-size:0.9rem; color:var(--ink-soft);">
              <span>Total</span><span id="totalAmount">${formatPrice(event.price)}</span>
            </div>
            <button class="btn btn-primary btn-block" id="bookBtn">Book tickets</button>
          `}
        </div>
      </div>
    </div>
  `;

  if (!past && !soldOut) {
    const qtyInput = document.getElementById('qty');
    const totalAmount = document.getElementById('totalAmount');
    qtyInput.addEventListener('input', () => {
      const qty = Number(qtyInput.value) || 0;
      totalAmount.textContent = formatPrice(event.price * qty);
    });
    document.getElementById('bookBtn').addEventListener('click', handleBook);
  }
}

function handleBook() {
  const user = Session.current();
  if (!user) {
    toast('Please log in to book tickets.', 'error');
    setTimeout(() => {
      window.location.href = `login.html?next=${encodeURIComponent('event-details.html?id=' + event.id)}`;
    }, 700);
    return;
  }

  const qtyInput = document.getElementById('qty');
  const qtyError = document.getElementById('qtyError');
  const qty = Number(qtyInput.value);
  const invalid = !Number.isInteger(qty) || qty < 1 || qty > event.seatsAvailable;

  qtyInput.closest('.field').classList.toggle('invalid', invalid);
  if (invalid) return;

  Bookings.add({
    userId: user.id,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventLocation: event.location,
    tickets: qty,
    totalPaid: event.price * qty,
  });

  Events.update(event.id, { seatsAvailable: event.seatsAvailable - qty });

  toast(`Booked! ${qty} ticket${qty > 1 ? 's' : ''} for ${event.title}.`);
  setTimeout(() => { window.location.href = 'my-bookings.html'; }, 800);
}
