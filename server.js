const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Слишком много запросов. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])).trim().slice(0, 500);
}

app.post('/api/contact', contactLimiter, (req, res) => {
  const { name, phone, email, service, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Заполните имя и телефон.' });
  }

  const clean = {
    name: sanitize(name),
    phone: sanitize(phone),
    email: sanitize(email || ''),
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
