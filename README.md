# API Test Automation Suite

REST API automation portfolio demonstrating **data-driven testing**, **JSON Schema validation**, and **parallel CI execution**.

[![Allure Report](https://github.com/ClarenceFerreiro/postman-api-tests/actions/workflows/allure-report.yml/badge.svg)](https://clarenceferreiro.github.io/postman-api-tests/)
[![TypeScript Tests v2](https://github.com/ClarenceFerreiro/postman-api-tests/actions/workflows/typescript-ci-v2.yml/badge.svg)](https://github.com/ClarenceFerreiro/postman-api-tests/actions)

---

## 📊 Metrics

| Layer | Tool | Tests | CI | Report |
|-------|------|-------|-----|--------|
| **API (collection)** | Postman + Newman | 5 requests / 7 checks | ✅ | [Allure](https://clarenceferreiro.github.io/postman-api-tests/) |
| **API (programmatic)** | TypeScript + Supertest + AJV | **30+ cases** | ✅ 4 parallel jobs | Junit XML |
| **Schema validation** | AJV + JSON Schema | all endpoints | ✅ | inline |
| **Performance** | Response-time tiers | 4 endpoints | ✅ `main` only | CI logs |

---

## 🧪 Test Categories

| Tag | Cases | What is covered |
|-----|-------|---------------|
| `@smoke` | 3 | critical paths: GET /posts/1, GET /posts, GET /users/1 |
| `@regression` | 8 | CRUD (POST variants), filtering, empty results |
| `@negative` | 14 | invalid IDs, SQLi, XSS, missing/wrong fields |
| `@performance` | 4 | latency classification: excellent / acceptable / slow / failed |
| `@boundary` | 3 | `_limit=0`, `_limit=100`, `_limit=-1` |
| `@data-driven` | 5 | parameterized: /posts, /users, /comments, /todos, /albums |

---

## 🚀 Quick Start

### Postman collection
```bash
npm install -g newman
newman run my-collection.json
```

### TypeScript suite (v2)
```bash
cd api-tests-ts
npm install
npm test                    # full suite
npm run test:smoke          # 3 critical cases
npm run test:regression     # CRUD + filtering
npm run test:negative       # security + invalid inputs
npm run test:performance    # latency thresholds
```

---

## ⚙️ CI/CD

4 parallel jobs triggered on every push to `main`:

```
smoke-tests ──→ regression-tests ──→ full-suite + Junit
     │                │
     └──────→ negative-tests ───────┘
                │
         performance-tests  (main only)
```

| Job | Trigger | Artifact on failure |
|-----|---------|---------------------|
| `Smoke Tests` | every push | smoke-test-results |
| `Regression Tests` | after smoke | coverage-report |
| `Negative Tests` | after smoke | — |
| `Performance Tests` | `main` branch only | — |
| `Full Suite + Junit` | after all | junit-report.xml |

---

## 📁 Structure

```
postman-api-tests/
├── .github/workflows/
│   ├── allure-report.yml          # Postman → Allure → GitHub Pages
│   ├── typescript-ci.yml          # legacy (kept for history)
│   └── typescript-ci-v2.yml       # NEW: 4 parallel jobs, coverage gate 80%
│
├── api-tests-ts/                   # TypeScript v2 suite
│   ├── src/
│   │   ├── __tests__/api.test.ts   # 30+ cases, data-driven (test.each)
│   │   ├── types/api.types.ts      # strict interfaces: Post, Comment, User...
│   │   ├── schemas/api.schemas.ts  # JSON Schema for AJV validation
│   │   └── config/env.ts           # .env, performance tiers, thresholds
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.ts
│
├── my-collection.json              # Postman collection (legacy demo)
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Language | **TypeScript 5** | strict typing, interfaces |
| HTTP client | **Supertest 7** | fluent API assertions |
| Runner | **Jest 29** | test.each, coverage, reporters |
| Schema | **AJV 8 + ajv-formats** | JSON Schema validation (`format: email`) |
| Config | **dotenv** | environment variables |
| CI | **GitHub Actions** | parallel jobs, artifacts |
| Reports | **Allure** (Postman), **Junit XML** (TS) | dashboards, test history |
| Bot | **Telegram + Railway** | notifications, run tests via `/run` |

---

## 🤖 Telegram Bot (Railway)

Bot hosted on **Railway** — receives CI notifications and test reports.

| Command | What it does |
|---------|-------------|
| `/start` | Welcome + command list |
| `/status` | Current test status snapshot |
| `/report` | Links to Allure / HTML reports |
| `/run` | Triggers GitHub Actions workflow via API |

**Planned:** inline keyboard buttons for easier control.

---

## 🔑 Key Features

- **Data-driven tests** — `test.each()` with parameterized payloads, IDs, endpoints
- **JSON Schema validation** — AJV validates structure + `email` format
- **Performance tiers** — classification by response time (excellent/acceptable/slow/failed)
- **Coverage gate** — 80% threshold enforced in CI
- **Security payloads** — SQL injection + XSS tested as negative scenarios
- **Environment config** — `.env.example` with timeout, retry, threshold settings

---

## 📈 Changelog

| Version | Date | Change |
|---------|------|--------|
| **v2.0** | 2026-06-04 | TypeScript rewrite: 30+ tests, data-driven, AJV, 4 CI jobs |
| v1.2 | — | Playwright E2E (local) |
| v1.1 | — | Postman + Newman + Allure |
| v1.0 | — | Initial setup |

---

## 🔗 Links

- [📊 Allure Report (Postman)](https://clarenceferreiro.github.io/postman-api-tests/)
- [⚙️ CI Runs](https://github.com/ClarenceFerreiro/postman-api-tests/actions)
- [📁 Source](https://github.com/ClarenceFerreiro/postman-api-tests)

---

*Portfolio for QA automation roles. Built with strict TypeScript, data-driven patterns, and CI-first mindset.*
