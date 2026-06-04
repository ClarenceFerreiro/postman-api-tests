# Postman API Tests — TypeScript v2

Автотесты для REST API на **TypeScript**, **Supertest**, **Jest**, **AJV** с data-driven подходом.

---

## 📊 Что улучшено

| Было (v1)                            | Стало (v2)                                                       |
|-------------------------------------|-------------------------------------------------------------------|
| `.js` файлы                         | Строгий **TypeScript** с типами                                |
| 4 теста                             | **30+ тестов** с data-driven паттернами                        |
| Только status code                  | **JSON Schema** валидация через AJV                              |
| Нет структуры                       | Слоистая архитектура: `types/`, `schemas/`, `config/`          |
| Один CI workflow                    | **4 параллельных job**: smoke → regression → negative → perf   |
| Hardcoded URL                      | **`.env` + конфиг**: base URL, timeout, performance thresholds  |
| Нет coverage                        | **Coverage gate** (80%) + отчёты                              |
| Нет тюнинга CI                      | **Junit XML**, артефакты, conditional jobs                     |

---

## 🏗️ Структура проекта

```
src/
├── __tests__/
│   └── api.test.ts          ← Основной тестовый файл (30+ кейсов)
├── types/
│   └── api.types.ts         ← Интерфейсы: Post, Comment, User…
├── schemas/
│   └── api.schemas.ts       ← JSON Schema для AJV валидации
└── config/
    ├── env.ts               ← Конфигурация + performance tiers
    └── setup.ts             ← Jest global setup
```

---

## 🚀 Запуск

```bash
cd postman-api-tests-ts
npm install

# Все тесты
npm test

# Только Smoke (3 быстрых сценария)
npm run test:smoke

# Только Regression (CRUD, фильтрация)
npm run test:regression

# Только Negative (невалидные данные)
npm run test:negative

# Только Performance (измерение времени)
npm run test:performance

# Coverage
npm run test:coverage

# Type checking (без запуска)
npm run typecheck

# Линт
npm run lint
```

---

## 🧪 Тестовые сценарии

### 🔥 Smoke Tests (3 кейса)
- GET /posts/1 — структура ответа валидна
- GET /posts — массив схож с JSON Schema
- GET /users/1 — вложенные объекты (address → geo)

### 📋 Regression: CRUD Posts (8 кейсов)
- CREATE с полными/минимальными/unicode/500char полями
- Фильтрация GET /posts?userId=1
- Пустой результат для несуществующего userId

### ❌ Negative Tests (14 кейсов)
- Невалидные ID: `99999`, `0`, `-1`, `1.5`, `abc`, `!@#$%`
- Security payloads: SQL injection, XSS
- POST с отсутствующими fields: title, body, userId
- Wrong types: title as number, userId as string

### ⚡ Performance Tests (4 кейса)
- GET /posts/1, /posts, /posts/1/comments, /users
- Threshold: <500ms (warning), <1000ms (failure)
- Classification: excellent / acceptable / slow / failed

### 📌 Edge Cases (3 кейса)
- `_limit=0` → пустой массив
- `_limit=100` → максимум 100 записей
- `_limit=-1` → graceful handling

### 🔍 Data-Driven: Parameterized (5 кейсов)
- Один шаблон для /posts, /users, /comments, /todos, /albums
- Проверка required fields через `test.each(scenarios)`

---

## ⚙️ CI/CD Pipeline

```
Push to main
│
├─ 🔥 Smoke Tests ────────┐
│   │                     │
│   ├─ 📋 Regression ─────┤── Parallel
│   ├─ 🧪 Negative ────────┤    (needs: smoke)
│   │                     │
└─ ⚡ Performance──────────┘
   │
   └─ ✅ Full Suite + Junit (after all)
```

[GitHub Actions](https://github.com/ClarenceFerreiro/postman-api-tests/actions)

---

## 🛠️ Технологии

| Инструмент     | Назначение                          |
|----------------|-------------------------------------|
| TypeScript 5   | Типизация, safety                   |
| Supertest 7    | HTTP assertions                     |
| Jest 29        | Test runner, coverage, `test.each` |
| ts-jest        | Компиляция TS в Jest               |
| AJV 8          | JSON Schema validation              |
| dotenv         | Environment конфигурация           |
| GitHub Actions | CI/CD с параллельными job           |

---

## 📁 Files to copy to your repo

```
postman-api-tests-ts/
├── package.json
├── tsconfig.json
├── jest.config.ts
├── eslint.config.mjs
├── .env.example
├── .gitignore
├── src/
│   ├── __tests__/api.test.ts
│   ├── types/api.types.ts
│   ├── schemas/api.schemas.ts
│   └── config/
│       ├── env.ts
│       └── setup.ts
└── .github/workflows/
    └── typescript-ci-v2.yml
```

---

## ⚠️ Migration notes

1. Удали старую папку `api-tests-ts` из репозитория
2. Скопируй всю папку `postman-api-tests-ts` в корень репозитория
3. Переименуй `postman-api-tests-ts` → `api-tests-ts` (или оставь новое имя)
4. Скопируй `.env.example` → `.env` и настрой переменные
5. Запусти `npm install` и `npm test`
6. Удали старый `typescript-ci.yml` из `.github/workflows/`
7. Переименуй `typescript-ci-v2.yml` → `typescript-ci.yml`

Готово! 🚀
