// api/get-ip.js — returns the caller's IP (used by AiChat moderation tracking)
// Raw Node res methods → works in both Vercel and Vite dev middleware.

export default function handler(req, res) {
  const ip =
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '';
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ ip }));
}
