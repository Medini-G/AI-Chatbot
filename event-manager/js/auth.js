const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
});
tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.style.display = 'block';
  loginForm.style.display = 'none';
});

function setInvalid(fieldEl, invalid) {
  fieldEl.classList.toggle('invalid', invalid);
}

function redirectAfterAuth() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');
  window.location.href = next || 'index.html';
}

/* ---------- login ---------- */
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailField = document.getElementById('loginEmail');
  const passField = document.getElementById('loginPassword');
  const email = emailField.value.trim();
  const password = passField.value;

  let valid = true;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setInvalid(emailField.closest('.field'), !emailOk);
  if (!emailOk) valid = false;

  setInvalid(passField.closest('.field'), password.length === 0);
  if (password.length === 0) valid = false;

  if (!valid) return;

  const user = Users.byEmail(email);
  if (!user || user.password !== password) {
    toast('Incorrect email or password.', 'error');
    return;
  }

  Session.login(user);
  toast(`Welcome back, ${user.name.split(' ')[0]}!`);
  setTimeout(redirectAfterAuth, 600);
});

/* ---------- register ---------- */
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameField = document.getElementById('regName');
  const emailField = document.getElementById('regEmail');
  const passField = document.getElementById('regPassword');
  const confirmField = document.getElementById('regConfirm');

  const name = nameField.value.trim();
  const email = emailField.value.trim();
  const password = passField.value;
  const confirm = confirmField.value;

  let valid = true;

  setInvalid(nameField.closest('.field'), name.length === 0);
  if (name.length === 0) valid = false;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setInvalid(emailField.closest('.field'), !emailOk);
  if (!emailOk) valid = false;

  setInvalid(passField.closest('.field'), password.length < 6);
  if (password.length < 6) valid = false;

  setInvalid(confirmField.closest('.field'), confirm !== password);
  if (confirm !== password) valid = false;

  if (!valid) return;

  if (Users.byEmail(email)) {
    toast('An account with that email already exists.', 'error');
    setInvalid(emailField.closest('.field'), true);
    return;
  }

  Users.register({ name, email, password });
  const user = Users.byEmail(email);
  Session.login(user);
  toast(`Account created — welcome, ${name.split(' ')[0]}!`);
  setTimeout(redirectAfterAuth, 600);
});
