const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/contact', (req, res) => {
  const { name, phone, email, service, message } = req.body;
  console.log('Новая заявка:', { name, phone, email, service, message });
  res.json({ success: true, message: 'Заявка принята! Мы свяжемся с вами в ближайшее время.' });
});

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
