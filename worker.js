const DEFAULT_CHAT_ID = 8875004720;

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const body = await request.json();
      const { name, phone, service, message, chat_id } = body;
      const cid = chat_id || DEFAULT_CHAT_ID;

      const text = `📬 *Новая заявка с сайта*\n\n👤 Имя: ${name || "—"}\n📞 Телефон: ${phone || "—"}\n🔧 Услуга: ${service || "Не указана"}\n💬 Сообщение: ${message || "Нет"}`;

      const tgRes = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cid,
          text: text,
          parse_mode: "Markdown"
        })
      });

      const tgData = await tgRes.json();
      return new Response(JSON.stringify({ ok: tgData.ok }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    return new Response("OK");
  }
};
