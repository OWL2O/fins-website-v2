// api/telegram-notify.js
// Sends admin notifications to Telegram when the AI collects a contact / alert.
// Raw Node res methods → works in both Vercel and Vite dev middleware.

async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) return JSON.parse(req.body);
  let data = '';
  for await (const chunk of req) data += chunk;
  return data ? JSON.parse(data) : {};
}
function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[telegram-notify] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return sendJson(res, 500, { error: 'Not configured' });
  }

  let body;
  try { body = await getJsonBody(req); }
  catch { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const now = new Date().toLocaleString('ka-GE', {
    timeZone: 'Asia/Tbilisi',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const text = (body.name || body.phone)
    ? `🔔 ახალი მოთხოვნა — FINS AI\n\n` +
      `👤 სახელი: ${body.name ?? '—'}\n` +
      `📞 ტელეფონი: ${body.phone ?? '—'}\n` +
      `💬 შენიშვნა: ${body.note ?? '—'}\n\n` +
      `⏰ ${now}`
    : `${body.message ?? '—'}\n\n⏰ ${now}`;

  const baseUrl = `https://api.telegram.org/bot${token}`;

  // Send photo + caption if a base64 data-URL photo was attached
  if (body.photo) {
    const match = body.photo.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      try {
        const [, mimeType, b64] = match;
        const photoBuffer = Buffer.from(b64, 'base64');
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', new Blob([photoBuffer], { type: mimeType }), 'photo.jpg');
        form.append('caption', text);
        const tgRes = await fetch(`${baseUrl}/sendPhoto`, { method: 'POST', body: form });
        if (tgRes.ok) return sendJson(res, 200, { ok: true });
        console.error('[telegram-notify] sendPhoto failed', tgRes.status, await tgRes.text().catch(() => ''));
      } catch (err) {
        console.error('[telegram-notify] photo encode error', err);
      }
    }
    // fall through to text-only on photo failure
  }

  const tgRes = await fetch(`${baseUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!tgRes.ok) {
    console.error('[telegram-notify] sendMessage error', tgRes.status, await tgRes.text().catch(() => ''));
    return sendJson(res, 502, { error: 'Telegram send failed' });
  }
  return sendJson(res, 200, { ok: true });
}
