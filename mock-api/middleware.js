// middleware.js — кастомные сценарии ошибок для mock API
// Используется с json-server для тестирования edge cases

module.exports = (req, res, next) => {
  
  // ─── Сценарий 1: 500 Internal Server Error ───────────────────────────
  // GET /users/500 — всегда возвращает 500
  if (req.method === 'GET' && req.path === '/users/500') {
    return res.status(500).json({
      error: 'Internal Server Error',
      code: 'DB_CONNECTION_FAIL',
      message: 'Database connection timeout at /users/500'
    });
  }

  // ─── Сценарий 2: Задержка (slow endpoint) ────────────────────────────
  // GET /users/slow — эмулирует тормозящий API (>3s)
  if (req.method === 'GET' && req.path === '/users/slow') {
    return setTimeout(() => {
      res.json({
        id: 999,
        name: 'Slow User',
        email: 'slow@test.com',
        delayMs: 3200
      });
    }, 3200);
  }

  // ─── Сценарий 3: Rate Limiting ────────────────────────────────────────
  // Каждый 10-й POST на /orders возвращает 429
  if (req.method === 'POST' && req.path === '/orders') {
    if (Math.random() < 0.1) {
      return res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: 60,
        limit: 10,
        period: '1m'
      });
    }
  }

  // ─── Сценарий 4: Validation Error (422) ───────────────────────────────
  // POST /users без email → 422
  if (req.method === 'POST' && req.path === '/users') {
    const body = req.body;
    if (!body.email || body.email === '') {
      return res.status(422).json({
        error: 'Validation Failed',
        field: 'email',
        message: 'Email is required and must be valid',
        received: body
      });
    }
    if (body.email && !body.email.includes('@')) {
      return res.status(422).json({
        error: 'Validation Failed',
        field: 'email',
        message: 'Email must contain @ symbol'
      });
    }
  }

  // ─── Сценарий 5: Unauthorized (401) ───────────────────────────────────
  // Любой запрос с заголовком X-Mock-Auth: invalid → 401
  if (req.headers['x-mock-auth'] === 'invalid') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }

  // ─── Сценарий 6: Forbidden (403) ────────────────────────────────────
  // DELETE /users/1 с X-Mock-Role: viewer → 403
  if (req.method === 'DELETE' && req.path.startsWith('/users/')) {
    if (req.headers['x-mock-role'] === 'viewer') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User with role "viewer" cannot delete resources'
      });
    }
  }

  // ─── Сценарий 7: Empty array (edge case) ────────────────────────────
  // GET /posts?userId=99999 → 200 с пустым массивом
  if (req.method === 'GET' && req.path === '/posts') {
    const userId = req.query.userId;
    if (userId === '99999') {
      return res.status(200).json([]);
    }
  }

  next();
};
