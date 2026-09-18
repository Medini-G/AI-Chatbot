const admin = Session.current();
if (!admin || admin.role !== 'admin') {
  window.location.href = 'index.html';
}

const modal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
const modalTitle = document.getElementById('modalTitle');

function renderStats() {
  document.getElementById('statEvents').textContent = Events.all().length;
  document.getElementById('statBookings').textContent = Bookings.all().length;
  document.getElementById('statFeedback').textContent = Feedback.all().length;
}

function renderEventsTable() {
  const events = Events.all().sort((a, b) => new Date(a.date) - new Date(b.date));
  const body = document.getElementById('eventsTableBody');

  if (!events.length) {
    body.innerHTML = `<tr><td colspan="6">No events yet. Click "Add event" to create one.</td></tr>`;
    return;
  }

  body.innerHTML = events.map((ev) => {
    const low = ev.seatsAvailable <= ev.seatsTotal * 0.15;
    return `
      <tr>
        <td>${ev.title}</td>
        <td>${ev.category}</td>
        <td class="num">${formatDate(ev.date)}</td>
        <td class="num">${formatPrice(ev.price)}</td>
        <td class="num"><span class="badge ${low ? 'badge-low' : 'badge-ok'}">${ev.seatsAvailable}/${ev.seatsTotal}</span></td>
        <td>
          <button class="btn btn-ghost btn-sm" data-edit="${ev.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-delete="${ev.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  body.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => openModal(btn.dataset.edit)));
  body.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', () => deleteEvent(btn.dataset.delete)));
}

function renderBookingsTable() {
  const bookings = Bookings.all().sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)).slice(0, 20);
  const body = document.getElementById('bookingsTableBody');

  if (!bookings.length) {
    body.innerHTML = `<tr><td colspan="5">No bookings yet.</td></tr>`;
    return;
  }

  body.innerHTML = bookings.map((b) => `
    <tr>
      <td class="mono">${b.id.toUpperCase()}</td>
      <td>${b.eventTitle}</td>
      <td class="num">${b.tickets}</td>
      <td class="num">${formatPrice(b.totalPaid)}</td>
      <td class="num">${new Date(b.bookedAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

/* ---------- modal ---------- */
function openModal(eventId) {
  eventForm.reset();
  document.querySelectorAll('#eventForm .field').forEach((f) => f.classList.remove('invalid'));

  if (eventId) {
    const ev = Events.byId(eventId);
    modalTitle.textContent = 'Edit event';
    document.getElementById('eventIdField').value = ev.id;
    document.getElementById('fTitle').value = ev.title;
    document.getElementById('fCategory').value = ev.category;
    document.getElementById('fDescription').value = ev.description;
    document.getElementById('fDate').value = ev.date;
    document.getElementById('fTime').value = ev.time;
    document.getElementById('fLocation').value = ev.location;
    document.getElementById('fPrice').value = ev.price;
    document.getElementById('fSeats').value = ev.seatsTotal;
    document.getElementById('fImage').value = ev.image;
  } else {
    modalTitle.textContent = 'Add event';
    document.getElementById('eventIdField').value = '';
  }
  modal.style.display = 'flex';
}
function closeModal() { modal.style.display = 'none'; }

document.getElementById('newEventBtn').addEventListener('click', () => openModal(null));
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const fields = {
    title: document.getElementById('fTitle'),
    category: document.getElementById('fCategory'),
    description: document.getElementById('fDescription'),
    date: document.getElementById('fDate'),
    time: document.getElementById('fTime'),
    location: document.getElementById('fLocation'),
    price: document.getElementById('fPrice'),
    seats: document.getElementById('fSeats'),
  };

  let valid = true;
  Object.values(fields).forEach((f) => {
    const empty = f.value.trim() === '';
    f.closest('.field').classList.toggle('invalid', empty);
    if (empty) valid = false;
  });
  if (Number(fields.price.value) < 0) { fields.price.closest('.field').classList.add('invalid'); valid = false; }
  if (Number(fields.seats.value) < 1) { fields.seats.closest('.field').classList.add('invalid'); valid = false; }
  if (!valid) return;

  const id = document.getElementById('eventIdField').value;
  const image = document.getElementById('fImage').value.trim() ||
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=60';

  const payload = {
    title: fields.title.value.trim(),
    category: fields.category.value.trim(),
    description: fields.description.value.trim(),
    date: fields.date.value,
    time: fields.time.value,
    location: fields.location.value.trim(),
    price: Number(fields.price.value),
    seatsTotal: Number(fields.seats.value),
    image,
  };

  if (id) {
    const existing = Events.byId(id);
    const seatsBooked = existing.seatsTotal - existing.seatsAvailable;
    payload.seatsAvailable = Math.max(0, payload.seatsTotal - seatsBooked);
    Events.update(id, payload);
    toast('Event updated.');
  } else {
    Events.add(payload);
    toast('Event created.');
  }

  closeModal();
  renderEventsTable();
  renderStats();
});

function deleteEvent(id) {
  if (!confirm('Delete this event? Existing bookings for it will remain on record but the event will no longer be listed.')) return;
  Events.remove(id);
  renderEventsTable();
  renderStats();
  toast('Event deleted.');
}

renderStats();
renderEventsTable();
renderBookingsTable();
