import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up to 10 users
    { duration: '1m', target: 10 },  // Steady state
    { duration: '30s', target: 20 },  // Spike to 20 users
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests under 500ms
    http_req_failed: ['rate<0.05'],   // Error rate under 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';

export default function () {
  // GET /posts
  const posts = http.get(`${BASE_URL}/posts`);
  check(posts, {
    'GET /posts status is 200': (r) => r.status === 200,
    'GET /posts response time < 500ms': (r) => r.timings.duration < 500,
  });

  // GET /posts/1
  const post = http.get(`${BASE_URL}/posts/1`);
  check(post, {
    'GET /posts/1 status is 200': (r) => r.status === 200,
    'GET /posts/1 has id': (r) => JSON.parse(r.body).id === 1,
  });

  // POST /posts
  const payload = JSON.stringify({
    title: `k6 test ${__VU}-${__ITER}`,
    body: 'load test body',
    userId: 1,
  });
  const created = http.post(`${BASE_URL}/posts`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(created, {
    'POST /posts status is 201': (r) => r.status === 201,
    'POST /posts returns id': (r) => JSON.parse(r.body).id !== undefined,
  });

  sleep(1);
}
