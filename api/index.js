const express = require('express');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])).trim().slice(0, 500);
}

app.post('/api/contact', (req, res) => {
  const { name, phone, service, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Заполните имя и телефон.' });
  }

  const clean = {
    name: sanitize(name),
    phone: sanitize(phone),
    service: sanitize(service || ''),
    message: sanitize(message || ''),
  };

  if (clean.name.length < 2) {
    return res.status(400).json({ success: false, message: 'Имя слишком короткое.' });
  }

  if (!/^\+?[\d\s\-()]{7,18}$/.test(clean.phone)) {
    return res.status(400).json({ success: false, message: 'Некорректный номер телефона.' });
  }

  console.log('Новая заявка:', clean);
  res.json({ success: true, message: 'Заявка принята! Мы свяжемся с вами в ближайшее время.' });
});

module.exports = app;
