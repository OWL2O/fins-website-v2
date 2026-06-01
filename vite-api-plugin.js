// vite-api-plugin.js
// ─────────────────────────────────────────────────────────────────────────────
// Serves the /api/*.js serverless functions IN-PROCESS during `vite dev`,
// so a single `npm run dev` runs both the frontend and the API.
//
// In production on Vercel these same files are deployed as real serverless
// functions — this plugin only affects local development.
//
// Uses server.ssrLoadModule so edits to /api/*.js hot-reload without restart.
// ─────────────────────────────────────────────────────────────────────────────

const ROUTES = {
  '/api/ai-chat':         '/api/ai-chat.js',
  '/api/get-ip':          '/api/get-ip.js',
  '/api/telegram-notify': '/api/telegram-notify.js',
};

export function apiDevServer() {
  return {
    name: 'fins-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const path = req.url.split('?')[0];
        const file = ROUTES[path];
        if (!file) return next();              // not an API route → let Vite handle it

        try {
          const mod = await server.ssrLoadModule(file);
          await mod.default(req, res);
        } catch (err) {
          console.error(`[api-dev] ${path}`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify({ error: 'Local API error — see terminal.' }));
        }
      });
    },
  };
}
