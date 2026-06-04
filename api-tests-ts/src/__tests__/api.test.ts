/**
 * Data-Driven API Tests
 * ===================
 * - Smoke tests: 3 критичных сценария
 * - Regression: CRUD, фильтрация, пагинация
 * - Negative: невалидные ID, malformed JSON, missing fields
 * - Performance: измерение времени ответа
 *
 * Используем: Supertest + Jest + AJV
 */

import request from 'supertest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { config, PerformanceTier, classifyPerformance } from '../config/env';
import { Post, Comment, User } from '../types/api.types';
import {
  postSchema,
  postArraySchema,
  commentSchema,
  userSchema,
  errorSchema,
} from '../schemas/api.schemas';

describe('🏗️  Smoke Tests', () => {
  const ajv = new Ajv({ allErrors: true, strictSchema: false });
  addFormats(ajv);
  const validatePost = ajv.compile(postSchema);
  const validatePostArray = ajv.compile(postArraySchema);

  test('GET /posts/1 — returns valid post structure [Smoke]', async () => {
    const res = await request(config.baseUrl).get('/posts/1');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('body');
    expect(res.body).toHaveProperty('userId');

    // JSON Schema validation via AJV
    const valid = validatePost(res.body);
    expect(valid).toBe(true);
    if (!valid) console.log('AJV errors:', validatePost.errors);
  });

  test('GET /posts — returns array of posts [Smoke]', async () => {
    const res = await request(config.baseUrl).get('/posts');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const valid = validatePostArray(res.body);
    expect(valid).toBe(true);
  });

  test('GET /users/1 — returns user with nested objects [Smoke]', async () => {
    const res = await request(config.baseUrl).get('/users/1');

    expect(res.status).toBe(200);
    const user = res.body as User;
    expect(user.id).toBe(1);
    expect(user).toHaveProperty('address');
    expect(user.address).toHaveProperty('geo');
    expect(user.address.geo).toHaveProperty('lat');
  });
});

describe('📋 Regression: CRUD Posts', () => {
  const ajv = new Ajv({ allErrors: true, strictSchema: false });
  addFormats(ajv);
  const validatePost = ajv.compile(postSchema);

  test.each([
    {
      desc: 'CREATE post with all fields',
      payload: { title: 'Test Title', body: 'Test Body', userId: 1 },
      expectedStatus: 201,
    },
    {
      desc: 'CREATE post with minimal fields',
      payload: { title: 'A', body: 'B', userId: 999 },
      expectedStatus: 201,
    },
    {
      desc: 'CREATE post with unicode',
      payload: { title: '🚀 Тест & 测试', body: 'Ñoño é Français', userId: 1 },
      expectedStatus: 201,
    },
    {
      desc: 'CREATE post with 500 chars title',
      payload: {
        title: 'A'.repeat(500),
        body: 'B'.repeat(2000),
        userId: 1,
      },
      expectedStatus: 201,
    },
  ])('POST /posts — $desc [Regression]', async ({ payload, expectedStatus }) => {
    const res = await request(config.baseUrl)
      .post('/posts')
      .send(payload);

    expect(res.status).toBe(expectedStatus);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(payload.title);
    expect(res.body.body).toBe(payload.body);

    // JSON Schema validation
    const valid = validatePost(res.body);
    expect(valid).toBe(true);
  });

  test('GET /posts?userId=1 — filter by userId [Regression]', async () => {
    const res = await request(config.baseUrl)
      .get('/posts')
      .query({ userId: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const posts = res.body as Post[];
    // В jsonplaceholder все посты userId=1 или 10
    const userOnePosts = posts.filter((p: Post) => p.userId === 1);
    expect(userOnePosts.length).toBeGreaterThan(0);
  });

  test('GET /posts?userId=999999 — empty array for non-existent user [Regression]', async () => {
    const res = await request(config.baseUrl)
      .get('/posts')
      .query({ userId: 999999 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});

describe('🧪 Regression: Comments & Users', () => {
  const ajv = new Ajv({ allErrors: true, strictSchema: false });
  addFormats(ajv);
  const validateComment = ajv.compile(commentSchema);

  test('GET /posts/1/comments — returns comments for post [Regression]', async () => {
    const res = await request(config.baseUrl).get('/posts/1/comments');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const comments = res.body as Comment[];
    comments.forEach((comment: Comment) => {
      expect(comment.postId).toBe(1);
      expect(comment).toHaveProperty('email');

      const valid = validateComment(comment);
      expect(valid).toBe(true);
    });
  });

  test('GET /users — returns all users [Regression]', async () => {
    const res = await request(config.baseUrl).get('/users');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const users = res.body as User[];
    const firstUser = users[0];
    expect(firstUser).toHaveProperty('company');
    expect(firstUser.company).toHaveProperty('catchPhrase');
  });
});

describe('❌ Negative Tests', () => {
  const ajv = new Ajv({ allErrors: true, strictSchema: false });
  addFormats(ajv);
  const validateError = ajv.compile(errorSchema);

  test.each([
    { desc: 'non-existent post id=99999', id: '99999', expectedStatus: 404 },
    { desc: 'zero as id', id: '0', expectedStatus: 404 },
    { desc: 'negative id', id: '-1', expectedStatus: 404 },
    { desc: 'float id', id: '1.5', expectedStatus: 404 },
    { desc: 'string instead of number', id: 'abc', expectedStatus: 404 },
    { desc: 'special characters', id: '!@#$%', expectedStatus: 404 },
    { desc: 'SQL injection payload', id: "1'; DROP TABLE posts--", expectedStatus: 404 },
    { desc: 'XSS payload', id: '<script>alert(1)</script>', expectedStatus: 404 },
  ])('GET /posts/$id — $desc returns $expectedStatus [Negative]', async ({ id, expectedStatus }) => {
    const res = await request(config.baseUrl).get(`/posts/${id}`);
    expect(res.status).toBe(expectedStatus);
  });

  test.each([
    {
      desc: 'empty body object',
      payload: {},
    },
    {
      desc: 'missing title',
      payload: { body: 'Test', userId: 1 },
    },
    {
      desc: 'missing body',
      payload: { title: 'Test', userId: 1 },
    },
    {
      desc: 'missing userId',
      payload: { title: 'Test', body: 'Test' },
    },
    {
      desc: 'title as number',
      payload: { title: 123, body: 'Test', userId: 1 },
    },
    {
      desc: 'userId as string',
      payload: { title: 'Test', body: 'Test', userId: 'abc' },
    },
  ])('POST /posts with $desc — jsonplaceholder accepts but validates [Negative]', async ({ payload }) => {
    // Примечание: jsonplaceholder не валидирует, но в реальном API это были бы 400/422
    const res = await request(config.baseUrl).post('/posts').send(payload);

    // Для реального API: expect([400, 422]).toContain(res.status);
    // Для jsonplaceholder (demo): принимает всё
    expect(res.status).toBe(201);

    // Проверяем, что ответ содержит минимум ID
    expect(res.body).toHaveProperty('id');
  });
});

describe('⚡ Performance Tests', () => {
  test.each([
    { endpoint: '/posts/1', expectedMaxDuration: config.performanceThreshold.warning },
    { endpoint: '/posts', expectedMaxDuration: config.performanceThreshold.warning },
    { endpoint: '/posts/1/comments', expectedMaxDuration: config.performanceThreshold.warning },
    { endpoint: '/users', expectedMaxDuration: config.performanceThreshold.warning },
  ])('GET $endpoint — response within ${expectedMaxDuration}ms [Performance]', async ({ endpoint, expectedMaxDuration }) => {
    const start = Date.now();
    const res = await request(config.baseUrl).get(endpoint);
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(expectedMaxDuration);

    const tier: PerformanceTier = classifyPerformance(duration);
    console.log(`   ⏱️ ${endpoint}: ${duration}ms (${tier})`);
  });
});

describe('🔍 Data-Driven: Parameterized GET scenarios', () => {
  interface GetScenario {
    endpoint: string;
    expectedStatus: number;
    expectedProps: string[];
  }

  const scenarios: GetScenario[] = [
    {
      endpoint: '/posts/1',
      expectedStatus: 200,
      expectedProps: ['id', 'title', 'body', 'userId'],
    },
    {
      endpoint: '/users/1',
      expectedStatus: 200,
      expectedProps: ['id', 'name', 'email', 'address'],
    },
    {
      endpoint: '/comments/1',
      expectedStatus: 200,
      expectedProps: ['id', 'name', 'email', 'body'],
    },
    {
      endpoint: '/todos/1',
      expectedStatus: 200,
      expectedProps: ['id', 'title', 'completed', 'userId'],
    },
    {
      endpoint: '/albums/1',
      expectedStatus: 200,
      expectedProps: ['id', 'title', 'userId'],
    },
  ];

  test.each(scenarios)(
    'GET $endpoint — returns $expectedStatus with required fields',
    async ({ endpoint, expectedStatus, expectedProps }) => {
      const res = await request(config.baseUrl).get(endpoint);

      expect(res.status).toBe(expectedStatus);
      expectedProps.forEach((prop) => {
        expect(res.body).toHaveProperty(prop);
      });
    },
  );
});

describe('📌 Edge Cases & Boundary Tests', () => {
  test('GET /posts?_limit=0 — returns empty array [Boundary]', async () => {
    const res = await request(config.baseUrl)
      .get('/posts')
      .query({ _limit: 0 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('GET /posts?_limit=100 — returns up to 100 posts [Boundary]', async () => {
    const res = await request(config.baseUrl)
      .get('/posts')
      .query({ _limit: 100 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(100);
  });

  test('GET /posts?_limit=-1 — handles negative gracefully [Boundary]', async () => {
    const res = await request(config.baseUrl)
      .get('/posts')
      .query({ _limit: -1 });

    // В реальном API: 400 Bad Request
    // jsonplaceholder: игнорирует параметр
    expect([200, 400]).toContain(res.status);
  });
});
