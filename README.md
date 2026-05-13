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

```bash
npm install -g newman
newman run my-collection.json
```

### TypeScript + Supertest
```bash
cd api-tests-ts
npm install
npm test
```

Playwright E2E
```bash
cd api-tests-ts
npx playwright test
npx playwright show-report
```

```markdown
## 📊 Allure Report
```
После каждого push автоматически генерируется и публикуется Allure Report:

🔗 **https://clarenceferreiro.github.io/postman-api-tests/**

Отчёт содержит:
- Статус прохождения 5 тест-кейсов
- Время выполнения каждого запроса
- Детальные шаги и проверки
- Графики и историю запусков

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

| Workflow | Триггер | Что делает |
|----------|---------|------------|
| `Allure Report` | push в main | Запускает Postman тесты → генерирует Allure отчёт → деплой на GitHub Pages |
| `TypeScript API Tests` | push в main | Устанавливает зависимости → запускает Jest → проверяет API через Supertest |

---

## 📁 Структура проекта

```
postman-api-tests/
├── .github/workflows/
│   ├── allure-report.yml      # Postman CI
│   └── typescript-ci.yml      # TypeScript CI
├── api-tests-ts/              # TypeScript + Playwright тесты
│   ├── api.test.js            # Supertest API тесты
│   ├── simple.test.js         # Простой тест для проверки CI
│   ├── playwright.config.ts   # Конфигурация Playwright
│   └── tests/                 # E2E тесты Playwright
├── docs/
│   └── index.html             # Главная страница отчётов
├── my-collection.json         # Postman коллекция (5 запросов)
└── README.md
```

## 🛠️ Технологии

| Инструмент | Назначение |
|------------|------------|
| Postman / Newman | Разработка и запуск API тестов |
| TypeScript + Supertest | Программные API тесты |
| Playwright | E2E и UI тестирование |
| Jest | Тестраннер и ассерты |
| Allure Report | Визуализация результатов |
| GitHub Actions | CI/CD автоматизация |
| GitHub Pages | Хостинг отчётов |

## 📈 Итоги сегодняшней работы

✅ Настроен CI для Postman тестов с Allure отчётами  
✅ Добавлен CI для TypeScript + Supertest  
✅ Интегрированы Playwright E2E тесты (локально)  
✅ Создан единый дашборд отчётов на GitHub Pages  
✅ Разрешены конфликты Git и налажен процесс деплоя  
✅ Написана полная документация в README  

---

## 🔗 Полезные ссылки

- [📊 Allure Report (Postman)](https://clarenceferreiro.github.io/postman-api-tests/)
- [⚙️ GitHub Actions (все запуски)](https://github.com/ClarenceFerreiro/postman-api-tests/actions)
- [📁 Репозиторий на GitHub](https://github.com/ClarenceFerreiro/postman-api-tests)

---

## 📝 Планы развития

- [x] Postman + Newman + Allure
- [x] TypeScript + Supertest + Jest
- [x] Playwright E2E тесты
- [x] GitHub Actions CI/CD
- [x] GitHub Pages для отчётов
- [ ] Добавить Playwright в CI
- [ ] Настроить уведомления в Telegram
- [ ] Написать нагрузочные тесты (k6)

---

*Автотесты для API — демонстрация навыков автоматизации тестирования*  
*Построено с ❤️ и 🚀 за один день*
