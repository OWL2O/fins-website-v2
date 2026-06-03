// api/send-contact.js
// Telegram admin alert for in-chat contact form submissions.
// Web3Forms (email) is called client-side in AiChat.jsx to satisfy domain key restrictions.

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

  let body;
  try { body = await getJsonBody(req); }
  catch { return sendJson(res, 400, { error: 'Invalid JSON' }); }

  const { name, phone, summary } = body;
  if (!phone?.trim()) return sendJson(res, 400, { error: 'phone required' });

  const displayName = name?.trim() || '—';
  const phoneStr    = phone.trim();
  const summaryStr  = summary?.trim() || '';

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return sendJson(res, 200, { ok: true }); // Telegram not configured — silent ok

  const now = new Date().toLocaleString('ka-GE', {
    timeZone: 'Asia/Tbilisi',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const text =
    `📋 საკონტაქტო ფორმა — FINS AI\n\n` +
    `👤 სახელი: ${displayName}\n` +
    `📞 ტელეფონი: ${phoneStr}\n` +
    (summaryStr ? `💬 საჭიროება: ${summaryStr}\n` : '') +
    `\n⏰ ${now}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) {
    console.error('[send-contact] telegram error', err);
  }

  return sendJson(res, 200, { ok: true });
}
