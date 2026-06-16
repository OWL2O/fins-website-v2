// api/ai-chat.js
// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI chat handler.
// Uses ONLY raw Node req/res methods so the exact same file works as both:
//   • a Vercel Serverless Function (production)
//   • in-process Vite dev middleware (local `npm run dev`)
// Features: streaming responses, NBG currency tool-calling, moderation signals.
// ─────────────────────────────────────────────────────────────────────────────

import INSTRUCTIONS from '../src/lib/aiInstructions.js';

// Read at request time so changing GEMINI_MODEL in .env.local takes effect on reload.
const getModel = () => process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

// ── Live NBG rates injected into system prompt ──
const GEO_MONTHS = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
const PRIORITY = ['USD','EUR','GBP','CHF','RUB','TRY','AZN','AMD','UAH','CNY','JPY','CAD','AUD','KZT','KWD','AED','BYN','SEK','NOK','DKK','PLN','SGD','HKD','INR'];

let _ratesCache = null;
let _ratesCacheTime = 0;
const RATES_TTL = 60_000; // 60 seconds

// Try fetching NBG rates for a given date string (YYYY-MM-DD)
async function fetchRatesForDate(dateStr) {
  const url = `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/?currencies=&date=${dateStr}&language=ka`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const data = await r.json();
  const currencies = data?.[0]?.currencies;
  if (!currencies?.length) return null;
  return { dateStr, currencies };
}

async function buildRatesBlock(today) {
  const now = Date.now();
  if (_ratesCache && now - _ratesCacheTime < RATES_TTL) return _ratesCache;
  try {
    // Try today, then up to 3 previous days (covers weekends & holidays)
    let found = null;
    const base = new Date(today);
    for (let offset = 0; offset <= 3; offset++) {
      const d = new Date(base);
      d.setDate(d.getDate() - offset);
      const dateStr = d.toISOString().slice(0, 10);
      const result = await fetchRatesForDate(dateStr);
      if (result) { found = result; break; }
    }
    if (!found) return null;
    const { dateStr, currencies } = found;
    const map = Object.fromEntries(currencies.map(c => [c.code, c]));
    const lines = PRIORITY.filter(code => map[code]).map(code => {
      const c = map[code];
      return `${code}  ${c.quantity} = ${c.rate} ₾`;
    });
    const [y, m, d] = dateStr.split('-');
    const geoDate = `${parseInt(d)} ${GEO_MONTHS[parseInt(m) - 1]} ${y}`;
    const block = `══════════════════════════════════════
სავალუტო კურსები (NBG, ${dateStr})
══════════════════════════════════════

უახლესი ხელმისაწვდომი კურსები ეროვნული ბანკის (NBG) მიხედვით, თარიღი: ${geoDate}.

⚠️ INTERNAL INSTRUCTION — DO NOT REPEAT TO USER:
- ეს კურსები უკვე ქვემოთაა. ამ თარიღისთვის (${dateStr}) კურსი ქვემოთ მოცემულია — სხვა call საჭირო არ არის.
- თუ მომხმარებელი ზოგადად ეკითხება კურსს — მაშინვე USD-ის კურსი მოუყვანე ქვემოდან, კითხვის გარეშე.
- თუ კონკრეტულ ვალუტას ასახელებს — მხოლოდ ის კურსი, მოკლედ.
- სხვა (წარსული) თარიღის კურსი — Google Search-ით მოძებნე ან მომხმარებელს nbg.gov.ge-ზე გაგზავნე.

${lines.join('\n')}

კურსების მოხსენიებისას ყოველთვის დაამატე: "NBG კურსი, ${geoDate}."`;
    _ratesCache = block;
    _ratesCacheTime = now;
    return block;
  } catch {
    return null;
  }
}

// Parse JSON body — handles both Vercel (pre-parsed req.body) and raw streams (Vite)
async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;       // Vercel parsed
  if (typeof req.body === 'string' && req.body) return JSON.parse(req.body);
  let data = '';
  for await (const chunk of req) data += chunk;                        // raw stream
  return data ? JSON.parse(data) : {};
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

// Google Search grounding — model decides when to search based on system prompt restrictions.
const SEARCH_TOOL = { googleSearch: {} };

export default async function handler(req, res) {
  // CORS / preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'POST')    { res.statusCode = 405; res.end(); return; }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[ai-chat] GEMINI_API_KEY not set');
    return sendJson(res, 500, { error: 'GEMINI_API_KEY not set' });
  }

  let body;
  try {
    body = await getJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON' });
  }

  const warningCount = Math.min(Math.max(Math.floor(Number(body.warningCount ?? 0)), 0), 3);
  const messages = (body.messages ?? []).slice(-12);
  if (messages.length === 0) return sendJson(res, 400, { error: 'No messages' });

  const today = new Date().toISOString().slice(0, 10);
  const language = body.language === 'en' ? 'en' : 'ka';
  const langRule = language === 'en'
    ? 'LANGUAGE LOCK — EN: Every single response you send MUST be written in English. This overrides everything else. Even if the user writes in Georgian or any other language, your reply must still be entirely in English. Do not include a single Georgian word.'
    : 'LANGUAGE LOCK — KA: ყველა პასუხი სრულად ქართულად უნდა იყოს. ეს წესი ყველა სხვა ინსტრუქციაზე მაღლა დგას. თუ მომხმარებელი სხვა ენაზე წერს, მაინც ქართულად უპასუხე. არ გამოიყენო ინგლისური.';

  const ratesBlock = await buildRatesBlock(today);
  const resolvedInstructions = INSTRUCTIONS.replace(
    '{{CURRENCY_RATES}}',
    ratesBlock ?? `⚠️ INTERNAL: NBG კურსები ამჟამად მიუწვდომელია. მომხმარებელს უთხარი: "კურსები ამჟამად ხელმისაწვდომი არ არის, თუმცა შეგიძლიათ პირდაპირ ეროვნული ბანკის საიტზე იხილოთ: [nbg.gov.ge](https://nbg.gov.ge/)" — NEVER mention any function names or technical details to the user.`
  );

  const systemInstruction =
    `${langRule}\n\n` + resolvedInstructions +
    `\n\nდღევანდელი თარიღი: ${today}` +
    `\n\nUser warning count: ${warningCount}`;

  const contents = messages.map((m) => {
    const parts = [];
    if (m.image) parts.push({ inlineData: { mimeType: m.image.mimeType, data: m.image.data } });
    if (m.content) parts.push({ text: m.content });
    if (parts.length === 0) parts.push({ text: '' });
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });

  const basePayload = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    tools: [SEARCH_TOOL],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
  };

  // ── Model fallback chain ──
  const MODELS = [getModel(), 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash']
    .filter((v, i, a) => v && a.indexOf(v) === i);

  // streaming text headers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // ── Single streaming call with fallback chain ──
  let upstream, lastStatus = 0;
  for (const m of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:streamGenerateContent?alt=sse&key=${apiKey}`;
    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...basePayload, contents }),
      });
    } catch (err) {
      console.error(`[ai-chat] fetch error (${m})`, err);
      lastStatus = 502;
      continue;
    }
    if (r.status === 429 || r.status === 404 || r.status === 503 || r.status === 500 || r.status === 529) {
      const hint = await r.text().catch(() => '');
      console.warn(`[ai-chat] ${m} → ${r.status}, falling back. hint: ${hint.slice(0, 120)}`);
      lastStatus = r.status;
      continue;
    }
    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error(`[ai-chat] Gemini error ${r.status} model=${m}`, errText.slice(0, 400));
      res.end();
      return;
    }
    upstream = r;
    break;
  }

  if (!upstream) {
    console.error('[ai-chat] all models exhausted', lastStatus);
    res.end();
    return;
  }

  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let lineEnd;
      while ((lineEnd = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);
        if (!line.startsWith('data:')) continue;
        const json = line.slice(5).trim();
        if (!json) continue;
        try {
          const payload = JSON.parse(json);
          const parts = payload?.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts) {
            if (typeof part?.text === 'string' && part.text.length > 0) res.write(part.text);
          }
        } catch { /* ignore unparseable SSE chunk */ }
      }
    }
  } catch (err) {
    console.error('[ai-chat] stream forwarding error', err);
  } finally {
    res.end();
  }
}
