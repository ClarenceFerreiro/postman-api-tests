/**
 * Mock-Specific Integration Tests
 * =============================
 * Эти тесты работают ТОЛЬКО против Docker Mock API.
 * Они проверяют сценарии, которые невозможно воспроизвести
 * на реальном jsonplaceholder API.
 * 
 * Запуск:
 *   TEST_ENV=mock BASE_URL=http://localhost:3000 npm test -- mock-integration.test.ts
 *   
 * Или через Docker:
 *   docker-compose up api-tests
 */

import request from 'supertest';
import { config } from '../config/env';

const describeMock = config.isMock ? describe : describe.skip;

// Conditional test — only runs in mock environment
const testMock = config.isMock ? test : test.skip;

describeMock('🧪 Mock-Specific Scenarios (Docker API)', () => {
  
  // ─── Сценарий 1: 500 Internal Server Error ───────────────────────────
  describe('🚨 Error Handling', () => {
    testMock('GET /users/500 returns 500 with structured error', async () => {
      const res = await request(config.baseUrl).get('/users/500');
      
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Internal Server Error');
      expect(res.body).toHaveProperty('code', 'DB_CONNECTION_FAIL');
      expect(res.body).toHaveProperty('message');
    });

    testMock('GET /users/slow returns 200 but exceeds SLA (3.2s delay)', async () => {
      const start = Date.now();
      const res = await request(config.baseUrl).get('/users/slow');
      const duration = Date.now() - start;
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('delayMs', 3200);
      expect(duration).toBeGreaterThanOrEqual(3000); // >3s
      expect(duration).toBeLessThan(4000); // but <4s
    });
  });

  // ─── Сценарий 2: Validation Errors (422) ──────────────────────────────
  describe('🛡️  Validation', () => {
    testMock('POST /users without email returns 422', async () => {
      const res = await request(config.baseUrl)
        .post('/users')
        .send({ name: 'No Email User' });
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error', 'Validation Failed');
      expect(res.body).toHaveProperty('field', 'email');
    });

    testMock('POST /users with invalid email returns 422', async () => {
      const res = await request(config.baseUrl)
        .post('/users')
        .send({ name: 'Bad Email', email: 'not-an-email' });
      
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error', 'Validation Failed');
      expect(res.body).toHaveProperty('field', 'email');
      expect(res.body.message).toContain('@');
    });
  });

  // ─── Сценарий 3: Rate Limiting ───────────────────────────────────────
  describe('⏱️  Rate Limiting', () => {
    testMock('POST /orders — ~10% requests return 429', async () => {
      // Отправляем 15 POST запросов ПОСЛЕДОВАТЕЛЬНО
      // Сервер rate-limit-ит каждый 10-й → 10-й будет 429
      const results: any[] = [];
      for (let i = 0; i < 15; i++) {
        const res = await request(config.baseUrl)
          .post('/orders')
          .send({ userId: 1, product: `Product ${i}`, qty: 1 });
        results.push(res);
      }
      
      const rateLimited = results.filter(r => r.status === 429);
      const created = results.filter(r => r.status === 201 || r.status === 200);
      
      // Каждый 10-й должен быть rate-limited → в 15 запросах минимум 1
      expect(rateLimited.length).toBeGreaterThanOrEqual(1);
      expect(created.length).toBeGreaterThanOrEqual(10);
      
      // Структура 429 ответа
      if (rateLimited.length > 0) {
        expect(rateLimited[0].body).toHaveProperty('error', 'Too Many Requests');
        expect(rateLimited[0].body).toHaveProperty('retryAfter');
      }
    });
  });

  // ─── Сценарий 4: Authorization (401, 403) ────────────────────────────
  describe('🔐 Authorization', () => {
    testMock('GET /users/1 with invalid token returns 401', async () => {
      const res = await request(config.baseUrl)
        .get('/users/1')
        .set('X-Mock-Auth', 'invalid');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    testMock('DELETE /users/1 with viewer role returns 403', async () => {
      const res = await request(config.baseUrl)
        .delete('/users/1')
        .set('X-Mock-Role', 'viewer');
      
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'Forbidden');
      expect(res.body.message).toContain('viewer');
    });
  });

  // ─── Сценарий 5: Empty Array Edge Case ──────────────────────────────
  describe('📭 Edge Cases', () => {
    testMock('GET /posts?_limit=0 returns empty array', async () => {
      const res = await request(config.baseUrl).get('/posts?_limit=0');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    testMock('GET /posts?_limit=-1 handles negative gracefully', async () => {
      const res = await request(config.baseUrl).get('/posts?_limit=-1');
      
      // В mock API может быть 200 (с пустым массивом) или 400 (bad request)
      // json-server ведёт себя по-разному на разных версиях
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThanOrEqual(400);
    });
  });

});
