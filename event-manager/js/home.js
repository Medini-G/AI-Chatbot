function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  const events = Events.all()
    .filter((e) => !isPastEvent(e.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (!events.length) {
    grid.innerHTML = `<div class="empty-state"><h3>No upcoming events yet</h3><p>Check back soon, or add one from the admin panel.</p></div>`;
    return;
  }
  grid.innerHTML = events.map(ticketCardHTML).join('');
}

function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  const events = Events.all();
  const categories = [...new Set(events.map((e) => e.category))];
  grid.innerHTML = categories.map((cat) => `
    <a href="events.html?category=${encodeURIComponent(cat)}" class="ticket" style="align-items:center; text-align:center; padding:26px 10px;">
      <h3 style="margin-bottom:4px;">${cat}</h3>
      <span class="ticket-seats">${events.filter((e) => e.category === cat).length} events</span>
    </a>
  `).join('');
}

document.getElementById('heroSearch').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = document.getElementById('heroSearchInput').value.trim();
  window.location.href = `events.html${q ? '?q=' + encodeURIComponent(q) : ''}`;
});

renderFeatured();
renderCategories();
