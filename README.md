# Postman API Tests

[![Allure Report](https://github.com/ClarenceFerreiro/postman-api-tests/actions/workflows/allure-report.yml/badge.svg)](https://clarenceferreiro.github.io/postman-api-tests/)
[![TypeScript Tests](https://github.com/ClarenceFerreiro/postman-api-tests/actions/workflows/typescript-ci.yml/badge.svg)](https://github.com/ClarenceFerreiro/postman-api-tests/actions)

Автотесты для REST API с использованием **Postman**, **Newman**, **TypeScript**, **Supertest**, **Playwright**, **GitHub Actions** и **Allure Report**.

---

## 📊 Проект в цифрах

| Тип тестов | Инструмент | Количество | CI | Отчёт |
|------------|------------|------------|----|-----|
| API (коллекции) | Postman + Newman | 5 запросов / 7 проверок | ✅ | Allure |
| API (программные) | TypeScript + Supertest | 4 теста | ✅ | Jest |
| E2E + UI | Playwright | 6 тестов | ⏳ локально | HTML |

---

## 🧪 Что тестируется

| Категория | Тесты |
|-----------|-------|
| **Позитивные** | GET пост ID=1 (200), POST новый пост (201), GET с фильтрацией по userId (200) |
| **Негативные** | GET несуществующий пост (404) |
| **Граничные** | POST с пустым телом (201 — API принимает) |
| **Программные** | Supertest: статусы, валидация JSON, ассерты |
| **E2E** | Playwright: UI проверки, скриншоты, трассировка |

---

## 🚀 Запуск тестов

### Postman (локально)

``bash
npm install -g newman
newman run my-collection.json

---

## TypeScript + Supertest
