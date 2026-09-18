document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const fields = {
    name: document.getElementById('cName'),
    email: document.getElementById('cEmail'),
    subject: document.getElementById('cSubject'),
    message: document.getElementById('cMessage'),
  };

  let valid = true;

  ['name', 'subject', 'message'].forEach((key) => {
    const empty = fields[key].value.trim() === '';
    fields[key].closest('.field').classList.toggle('invalid', empty);
    if (empty) valid = false;
  });

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim());
  fields.email.closest('.field').classList.toggle('invalid', !emailOk);
  if (!emailOk) valid = false;

  if (!valid) return;

  Messages.add({
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    subject: fields.subject.value.trim(),
    message: fields.message.value.trim(),
  });

  toast('Message sent — we\'ll get back to you soon.');
  document.getElementById('contactForm').reset();
});
