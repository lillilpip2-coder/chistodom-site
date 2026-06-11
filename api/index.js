module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const { name, phone, service, message } = data;

      if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Заполните имя и телефон.' });
      }

      if (name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Имя слишком короткое.' });
      }

      if (!/^\+?[\d\s\-()]{7,18}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Некорректный номер телефона.' });
      }

      console.log('Новая заявка:', { name, phone, service, message });
      res.json({ success: true, message: 'Заявка принята! Мы свяжемся с вами в ближайшее время.' });
    } catch {
      res.status(400).json({ success: false, message: 'Ошибка данных.' });
    }
  });
};
