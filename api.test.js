const request = require('supertest');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test('GET /posts/1 returns 200', async () => {
  const response = await request(BASE_URL).get('/posts/1');
  expect(response.status).toBe(200);
});

test('GET /posts/1 returns id=1', async () => {
  const response = await request(BASE_URL).get('/posts/1');
  expect(response.body.id).toBe(1);
});

test('GET /posts/999 returns 404', async () => {
  const response = await request(BASE_URL).get('/posts/999');
  expect(response.status).toBe(404);
});

test('POST /posts creates new post', async () => {
  const newPost = {
    title: 'Test from Supertest',
    body: 'Created via API test',
    userId: 1
  };
  
  const response = await request(BASE_URL)
    .post('/posts')
    .send(newPost);
  
  expect(response.status).toBe(201);
  expect(response.body.title).toBe(newPost.title);
});