// server.js — упрощённый mock API сервер
// Замена json-server для стабильной работы в Docker

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || './db.json';

// Load data
let db = {};
try {
  db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`✅ Loaded data from ${DATA_FILE}`);
} catch (e) {
  console.error(`❌ Failed to load ${DATA_FILE}:`, e.message);
  process.exit(1);
}

// Helper: find item by id
function findById(array, id) {
  return array.find(item => item.id === parseInt(id) || item.id === id);
}

// Helper: filter array
function filterArray(array, query) {
  return array.filter(item => {
    for (const [key, value] of Object.entries(query)) {
      if (item[key] === undefined) return false;
      if (item[key].toString() !== value) return false;
    }
    return true;
  });
}

// Parse query string
function parseQuery(url) {
  const query = {};
  const idx = url.indexOf('?');
  if (idx === -1) return { path: url, query };
  
  const pathPart = url.substring(0, idx);
  const queryString = url.substring(idx + 1);
  
  queryString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) query[key] = decodeURIComponent(value || '');
  });
  
  return { path: pathPart, query };
}

// CORS headers
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Mock-Auth, X-Mock-Role');
}

// Rate limiting counter (persistent per request batch won't work with parallel requests)
// Use a simple time-based or count-based approach
let requestCount = 0;
const RATE_LIMIT_EVERY = 10;

const server = http.createServer((req, res) => {
  setCORS(res);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const { path: reqPath, query } = parseQuery(req.url);
  const parts = reqPath.split('/').filter(Boolean);
  const resource = parts[0];
  const id = parts[1];

  console.log(`${req.method} ${req.url}`);

  // ─── MIDDLEWARE SCENARIOS ─────────────────────────────────────────

  // 1. GET /users/500 → 500 error
  if (req.method === 'GET' && reqPath === '/users/500') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      code: 'DB_CONNECTION_FAIL',
      message: 'Database connection failed'
    }));
    return;
  }

  // 2. GET /users/slow → delay 3200ms
  if (req.method === 'GET' && reqPath === '/users/slow') {
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ delayMs: 3200, users: db.users || [] }));
    }, 3200);
    return;
  }

  // 3. Rate limiting: every 10th POST to /orders
  if (req.method === 'POST' && reqPath === '/orders') {
    requestCount++;
    if (requestCount % RATE_LIMIT_EVERY === 0) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Too Many Requests',
        retryAfter: 60
      }));
      return;
    }
  }

  // 4. POST /users validation
  if (req.method === 'POST' && reqPath === '/users') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.email || data.email === '') {
          res.writeHead(422, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Validation Failed',
            field: 'email',
            message: 'Email is required and must contain @'
          }));
          return;
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          res.writeHead(422, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Validation Failed',
            field: 'email',
            message: 'Email must contain @'
          }));
          return;
        }
        // Success
        const newUser = { ...data, id: (db.users?.length || 0) + 1 };
        if (!db.users) db.users = [];
        db.users.push(newUser);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 5. Authorization check
  const mockAuth = req.headers['x-mock-auth'];
  const mockRole = req.headers['x-mock-role'];

  if (mockAuth === 'invalid') {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  if (req.method === 'DELETE' && mockRole === 'viewer') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Role viewer cannot perform DELETE operations'
    }));
    return;
  }

  // ─── CRUD OPERATIONS ─────────────────────────────────────────────

  if (!db[resource]) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const collection = db[resource];

  // GET collection
  if (req.method === 'GET' && !id) {
    let result = collection;
    
    // Apply query filters
    if (Object.keys(query).length > 0) {
      result = filterArray(collection, query);
    }
    
    // Pagination
    if (query._limit) {
      const limit = parseInt(query._limit);
      if (limit >= 0) {
        result = result.slice(0, limit);
      }
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // GET single item
  if (req.method === 'GET' && id) {
    const item = findById(collection, id);
    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(item));
    return;
  }

  // POST create
  if (req.method === 'POST' && !id) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newItem = { ...data, id: collection.length + 1 };
        collection.push(newItem);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // DELETE /users/:id with viewer role → 403
  if (req.method === 'DELETE' && resource === 'users' && id && mockRole === 'viewer') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Forbidden',
      message: 'Role viewer cannot perform DELETE operations'
    }));
    return;
  }

  // DELETE /users/:id (allowed for admin)
  if (req.method === 'DELETE' && resource && id) {
    const idx = collection.findIndex(item => item.id === parseInt(id) || item.id === id);
    if (idx === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    collection.splice(idx, 1);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ deleted: true, id: parseInt(id) }));
    return;
  }

  // Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mock API running on http://0.0.0.0:${PORT}`);
  console.log(`📚 Resources: ${Object.keys(db).join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
