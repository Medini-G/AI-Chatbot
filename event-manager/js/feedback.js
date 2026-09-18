let selectedRating = 0;
const stars = document.querySelectorAll('#ratingInput span');

stars.forEach((star) => {
  star.addEventListener('click', () => {
    selectedRating = Number(star.dataset.value);
    updateStars();
  });
});

function updateStars() {
  stars.forEach((s) => s.classList.toggle('active', Number(s.dataset.value) <= selectedRating));
}

function renderFeedbackList() {
  const list = Feedback.all();
  const listEl = document.getElementById('feedbackList');

  if (!list.length) {
    listEl.innerHTML = `<div class="empty-state"><h3>No feedback yet</h3><p>Be the first to share your thoughts.</p></div>`;
    return;
  }

  listEl.innerHTML = list.map((f) => `
    <div class="booking-card" style="align-items:flex-start;">
      <div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
          <strong>${f.name}</strong>
          <span class="stars">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
        </div>
        <p style="margin:0; max-width:420px;">${f.message}</p>
        <span class="code">${new Date(f.date).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');
}

document.getElementById('feedbackForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const nameField = document.getElementById('fbName');
  const msgField = document.getElementById('fbMessage');

  let valid = true;
  const nameEmpty = nameField.value.trim() === '';
  nameField.closest('.field').classList.toggle('invalid', nameEmpty);
  if (nameEmpty) valid = false;

  const msgEmpty = msgField.value.trim() === '';
  msgField.closest('.field').classList.toggle('invalid', msgEmpty);
  if (msgEmpty) valid = false;

  if (selectedRating === 0) {
    toast('Please select a star rating.', 'error');
    valid = false;
  }

  if (!valid) return;

  Feedback.add({ name: nameField.value.trim(), message: msgField.value.trim(), rating: selectedRating });
  toast('Thanks for the feedback!');

  document.getElementById('feedbackForm').reset();
  selectedRating = 0;
  updateStars();
  renderFeedbackList();
});

renderFeedbackList();
