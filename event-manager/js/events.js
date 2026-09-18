const grid = document.getElementById('eventsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const resultCount = document.getElementById('resultCount');

function populateCategories() {
  const categories = [...new Set(Events.all().map((e) => e.category))].sort();
  categoryFilter.innerHTML = '<option value="">All categories</option>' +
    categories.map((c) => `<option value="${c}">${c}</option>`).join('');
}

function applyFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) searchInput.value = params.get('q');
  if (params.get('category')) categoryFilter.value = params.get('category');
}

function renderEvents() {
  const q = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortSelect.value;

  let events = Events.all().filter((e) => {
    const matchesQuery = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    const matchesCategory = !category || e.category === category;
    return matchesQuery && matchesCategory;
  });

  events.sort((a, b) => {
    if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'seats-asc') return a.seatsAvailable - b.seatsAvailable;
    return 0;
  });

  resultCount.textContent = `${events.length} event${events.length === 1 ? '' : 's'} found`;

  if (!events.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>No events match your search</h3><p>Try a different keyword or clear the filters.</p></div>`;
    return;
  }
  grid.innerHTML = events.map(ticketCardHTML).join('');
}

[searchInput, categoryFilter, sortSelect].forEach((el) => {
  el.addEventListener('input', renderEvents);
  el.addEventListener('change', renderEvents);
});

populateCategories();
applyFiltersFromURL();
renderEvents();
