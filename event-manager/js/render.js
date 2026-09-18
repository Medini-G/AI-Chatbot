function ticketCardHTML(ev) {
  const seatsLow = ev.seatsAvailable <= ev.seatsTotal * 0.15 && ev.seatsAvailable > 0;
  const soldOut = ev.seatsAvailable <= 0;
  const past = isPastEvent(ev.date);
  return `
    <a href="event-details.html?id=${ev.id}" class="ticket">
      <div class="ticket-image" style="background-image:url('${ev.image}')">
        <span class="ticket-category">${ev.category}</span>
      </div>
      <div class="ticket-body">
        <h3>${ev.title}</h3>
        <div class="ticket-meta">
          <span>📅 ${formatDate(ev.date)} · ${ev.time}</span>
          <span>📍 ${ev.location}</span>
        </div>
        <p class="ticket-desc">${ev.description}</p>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-stub">
        <span class="ticket-price">${formatPrice(ev.price)}</span>
        <span class="ticket-seats ${seatsLow || soldOut ? 'low' : ''}">${past ? 'Event ended' : soldOut ? 'Sold out' : ev.seatsAvailable + ' seats left'}</span>
      </div>
    </a>
  `;
}
