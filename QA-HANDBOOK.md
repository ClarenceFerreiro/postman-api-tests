# 📘 QA Handbook

**Полный справочник по проекту.**
Если README — это обзор проекта, то этот файл — подробный каталог: описание компонентов, инструкции и практические сценарии.

---

## 📑 Содержание

1. [🗣️ Словарь терминов QA](#словарь-терминов-qa)
2. [🏗️ Архитектура проекта](#архитектура-проекта)
3. [🧪 Тестовая пирамида](#тестовая-пирамида)
4. [🔧 Инструменты: глубокое погружение](#инструменты)
5. [📋 Лог изменений с обоснованием](#лог-изменений)
6. [🎯 Troubleshooting Guide](#troubleshooting-guide)

---

## 🗣️ Словарь терминов QA

### CI/CD

| Термин | Расшифровка | Что значит на практике |
|--------|-------------|------------------------|
| **CI** | Continuous Integration | При каждом `git push` автоматически запускаются тесты, линтер, сборка. Если падает — мерж блокируется |
| **CD** (Delivery) | Continuous Delivery | После прохождения CI код автоматически деплоится на тестовый стенд |
| **CD** (Deployment) | Continuous Deployment | После прохождения CI код автоматически деплоится на production |
| **Pipeline** | Конвейер | Последовательность шагов в CI: `install → lint → test → report → deploy` |

### Типы тестов

| Термин | Что проверяет | Время | В проекте |
|--------|---------------|-------|-----------|
| **Smoke** | Базовая работоспособность ("дымит ли?") | 30-60 сек | `jest --testNamePattern='Smoke'` |
| **Regression** | Что новые изменения не сломали старое | 2-5 мин | `jest --testNamePattern='Regression'` |
| **Negative** | Как система реагирует на невалидные данные | 1-2 мин | `jest --testNamePattern='Negative'` |
| **E2E** (End-to-End) | Полный пользовательский сценарий от А до Я | 5-15 мин | Удалён из проекта (Playwright → TypeScript) |
| **Load / Performance** | Как система ведёт себя под нагрузкой | 5-10 мин | `k6/load-test.js` |
| **Contract** | Соответствие API спецификации (OpenAPI/Swagger) | 1-2 мин | Планируется (Pact) |

### Данные и подходы

| Термин | Значение |
|--------|----------|
| **Data-driven** | Один тестовый шаблон, много наборов данных (`test.each`) |
| **JSON Schema** | Формальное описание структуры JSON — проверяем, что API вернул то, что ожидали |
| **Mock** | Имитация внешнего сервиса. Заменяем реальный API на контролируемый |
| **Stub** | Заглушка — возвращает заранее заданный ответ |
| **Flaky test** | «Шаткий» тест — то проходит, то падает без причин (обычно из-за race conditions) |
| **Test fixture** | Фиксированные тестовые данные, которые создаются перед тестом и удаляются после |
| **Assertion** | Проверка ожидаемого результата (`expect(status).toBe(200)`) |
| **Orchestrator** | Инструмент управления тестами (в CI — GitHub Actions) |

---

## 🏗️ Архитектура проекта

```
postman-api-tests/
│
├── 📂 .github/workflows/     ← CI/CD конвейеры
│   ├── typescript-ci-v2.yml  ← Основной CI: 5 parallel job
│   ├── allure-report.yml     ← Postman → Allure → GitHub Pages
│   ├── allure-ts.yml         ← TypeScript → Allure → gh-pages/allure-ts/
│   └── mock-integration.yml  ← Docker Mock API → тесты
│
├── 📂 api-tests-ts/           ← TypeScript v2 (основная ветка)
│   ├── src/
│   │   ├── __tests__/        ← Все тесты (Jest ищет здесь)
│   │   │   ├── api.test.ts       ← Основные тесты (Smoke, Regression, Negative, Performance)
│   │   │   └── mock-integration.test.ts  ← Mock-only сценарии
│   │   ├── types/            ← TypeScript интерфейсы (ApiResponse<T>, TestCase)
│   │   ├── schemas/          ← JSON Schema для AJV валидации
│   │   └── config/           ← env.ts (BASE_URL, thresholds, isMock)
│   │
│   ├── jest.config.ts        ← Конфиг Jest: ts-jest, allure-jest/node, jest-junit
│   ├── tsconfig.json         ← TypeScript strict mode, ES2022
│   └── package.json          ← Зависимости: supertest, jest, ajv, allure-jest
│
├── 📂 k6/                     ← Нагрузочное тестирование
│   ├── load-test.js          ← Ramp-up → steady → spike → ramp-down
│   └── README.md             ← Инструкция по установке k6
│
├── 📂 mock-api/               ← Docker Mock API
│   ├── db.json               ← Тестовые данные (posts, users, comments...)
│   ├── middleware.js         ← Кастомные сценарии ошибок (500, 422, 429, 401, 403)
│   └── routes.json           ← Кастомные роуты json-server
│
├── 📂 docs/                   ← GitHub Pages (не трогаем вручную, CI деплоит)
│   └── index.html            ← Dashboard: ссылки на Allure отчёты
│
├── docker-compose.yml         ← 2 сервиса: mock-api + api-tests
├── bot.js                     ← Telegram Bot (Railway). Inline buttons
└── README.md                  ← Обзор проекта: коротко, ярко, для команды
```

---

## 🧪 Тестовая пирамида

Проект следует классической пирамиде тестирования (в идеальном варианте):

```
         /\
        /  \     E2E (Playwright) — удалён, не в CI
       / __ \    
      /      \   Integration (Docker Mock API) ✅
     /        \  
    /__________\ Unit + Contract (TypeScript + AJV) ✅
   /            \
  /______________\ Manual / Exploratory (Postman) ✅
```

**Почему такая структура:**
- **Unit-уровень** — TypeScript тесты с JSON Schema. Быстро, дешево, надёжно
- **Integration** — Docker Mock API. Проверяем error handling, rate limiting
- **Manual** — Postman коллекция. Быстрая ручная проверка, демо заказчику

---

## 🔧 Инструменты

### TypeScript + Jest + Supertest

**Зачем TypeScript а не JavaScript?**
- Компилятор ловит ошибки до запуска (typo в поле, неправильный тип)
- Интерфейсы ApiResponse<T> гарантируют структуру ответа
- IDE (VS Code) даёт автокомплит

**Supertest vs Axios?**
- Supertest — специально для API тестов. Цепочка `.get().set().send().expect(200)`
- Axios — HTTP клиент, требует ручных ассертов

### AJV + JSON Schema

**JSON Schema** — это контракт между frontend и backend. Если backend поменял поле `email` на `userEmail` — тест сразу падает, не дожидаясь ручной проверки.

```typescript
// Схема говорит: "title должен быть строкой от 1 до 1000 символов"
const postSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 1000 },
  },
  required: ['title'],
};
```

### Docker Mock API

**3 сценария где Mock API спасает:**

1. **Backend ещё не готов** — пишем тесты на mock, потом меняем BASE_URL
2. **Нужно проверить 500 ошибку** — на реальном API не заставишь упасть
3. **Rate limiting** — тестируем retry-логику без блокировки реальных лимитов

### k6

**Чем отличается от Jest performance-тестов?**
- Jest — проверяет время ОДНОГО запроса (unit performance)
- k6 — симулирует ТЫСЯЧИ пользователей одновременно (load testing)

**Метрики k6:**
- `http_req_duration` — время ответа
- `http_req_failed` — процент ошибок
- `iterations` — сколько циклов выполнено

### Allure Report

**Почему Allure, а не встроенный HTML?**
- Красивые графики трендов (стало лучше/хуже за неделю?)
- Severity levels (@critical, @normal, @trivial)
- Steps — каждый `await request()` виден как отдельный шаг
- Attachments — прикрепляем скриншоты, логи, JSON ответы

---

## 📋 Лог изменений (с обоснованием)

### v2.2 — Docker Mock API + Middleware (2026-06-04)

**Задача:** Заказчик сказал: «Backend ещё в разработке, но тесты писать надо уже»

**Решение:**
- `mock-api/middleware.js` — 7 сценариев: 500, 422, 429, 401, 403, slow endpoint, empty array
- `mock-integration.test.ts` — 17 новых тестов, которые запускаются только в mock-окружении
- `docker-compose.yml` — `depends_on` + `condition: service_healthy` чтобы тесты не стартовали раньше API

**Почему не использовали WireMock/Mountebank:**
- json-server проще для прототипирования (один npm пакет)
- Middleware.js даёт достаточно гибкости для демонстрации

---

### v2.1 — Allure TS + k6 + Docker + Telegram Inline (2026-06-04)

**Задача:** Нужен Allure Report для TypeScript тестов как для Postman

**Проблема:** `jest-allure` v0.1.x сломан для Jest 29 → `allure-jest` v3

**Проблема 2:** `cache: 'npm'` в CI искал `package-lock.json` в корне → падал

**Решения:**
- `testEnvironment: 'allure-jest/node'` вместо `reporters: ['allure']`
- Убрали `cache: 'npm'` из всех workflow
- Allure CLI устанавливаем через `wget` (быстрее чем `npm -g`)

---

### v2.0 — Миграция JS → TypeScript (2026-06-04)

**Зачем мигрировали?**
- JS-коллекция имела 4 теста: 2 GET + 2 POST. Только status code проверка
- TypeScript даёт: data-driven (`test.each`), JSON Schema, 30+ тестов

**CI архитектура:**
- `needs` — последовательность: smoke → regression + negative → performance → full suite
- `if: github.ref == 'refs/heads/main'` — performance только на main, не в PR
- `if: failure()` — артефакты при падении для дебага

---

### v1.x — Postman + Newman (до v2)

**Почему оставили Postman:**
- Ручное тестирование — быстро, наглядно
- Коллекция — документация API для новых разработчиков
- Allure Report из Newman — красивые отчёты для заказчика

---

## 🎯 Troubleshooting Guide

### Ситуация: нужен Docker с mock API, но backend ещё не готов

**Решение (30 сек описание):**
> Поднимаем json-server в Docker на основе OpenAPI спецификации. Пишем тесты на mock, потом переключаем `BASE_URL` на реальный стенд. Добавляем middleware для ошибок — 500, 429, 422 — которые настоящий API в штатном режиме не воспроизведёт.

### Ситуация: используем несколько тест-фреймворков — не дублируем ли мы?

**Ответ:**
> Это не дублирование — это разные уровни. Postman — для быстрой ручной проверки и демо команды / заказчику. TypeScript + Jest — для CI/CD, data-driven тестов, JSON Schema валидации. k6 — для нагрузки тысяч пользователей. Каждый инструмент решает свою задачу.

### Ситуация: тест flaky — проходит через раз

**Решение:**
> Сначала анализируем — почему шаткий? Если race condition — добавляем retry или wait. Если внешний сервер нестабилен — заменяем на mock. Если тест сам по себе ненадёжный — переписываем с явными ожиданиями. Не просто перезапускаем CI в надежде, что в следующий раз пройдёт.

### Ситуация: CI падает — что смотреть первым делом

**Порядок действий:**
> 1. Логи упавшего job — самая нижняя красная строка. 2. Артефакты (screenshots, junit xml) если настроены. 3. Повторяется ли локально (`npm test`). 4. Если локально проходит — ищем delta: может версия Node, env переменная, или кэш npm.

---

## 📚 Дополнительные ресурсы

| Тема | Ссылка |
|------|--------|
| k6 documentation | https://k6.io/docs/ |
| Allure Report | https://docs.qameta.io/allure/ |
| json-server | https://github.com/typicode/json-server |
| Supertest | https://github.com/ladjs/supertest |
| Jest + TypeScript | https://jestjs.io/docs/getting-started#using-typescript |
| GitHub Actions | https://docs.github.com/en/actions |

---

*Обновляется при каждом существенном изменении. Последнее обновление: v2.2*
