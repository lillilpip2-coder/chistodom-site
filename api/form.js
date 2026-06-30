export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { name, phone, service, message } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ ok: false, error: 'Введите имя (минимум 2 символа)' });
  }

  const digits = (phone || '').replace(/\D/g, '');
  if (!digits || digits.length < 10) {
    return res.status(400).json({ ok: false, error: 'Введите корректный номер телефона' });
  }

  const chatId = process.env.TELEGRAM_CHAT_ID;
  const botToken = process.env.TELEGRAM_TOKEN;

  if (!chatId || !botToken) {
    return res.status(500).json({ ok: false, error: 'Сервис не настроен' });
  }

  const text = `📬 *Новая заявка с сайта*\n\n👤 Имя: ${name.trim()}\n📞 Телефон: ${phone.trim()}\n🔧 Услуга: ${service || 'Не указана'}\n💬 Сообщение: ${message || 'Нет'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    const data = await response.json();
    if (data.ok) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(500).json({ ok: false, error: 'Ошибка отправки в Telegram' });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Ошибка сети' });
  }
}
