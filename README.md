# Postman API Tests

[![CI Status](https://github.com/ClarenceFerreiro/postman-api-tests/actions/workflows/allure-report.yml/badge.svg)](https://github.com/ClarenceFerreiro/postman-api-tests/actions)
[![Allure Report](https://img.shields.io/badge/📊-Allure%20Report-blue)](https://clarenceferreiro.github.io/postman-api-tests/)

Автотесты для REST API с использованием **Postman**, **Newman**, **GitHub Actions** и **Allure Report**.

---

## 📋 О проекте

Проект демонстрирует навыки автоматизации тестирования API. Тесты написаны в Postman, запускаются через Newman в CI/CD пайплайне GitHub Actions, а отчёты публикуются на GitHub Pages с визуализацией в Allure.

---

## 🧪 Что тестируется

| Категория | Тесты |
|-----------|-------|
| **Позитивные** | GET пост ID=1 (200), POST новый пост (201), GET с фильтрацией по userId (200) |
| **Негативные** | GET несуществующий пост (404) |
| **Граничные** | POST с пустым телом (201 — API принимает) |

- **Авторизация** — Bearer Token, получение и передача токена

---

## 🚀 Запуск тестов

### Локально (требуется Node.js)

# Установка Newman
npm install -g newman

# Запуск коллекции
newman run my-collection.json

## 📊 Отчёты Allure

После каждого запуска генерируется и публикуется Allure Report:

🔗 **https://clarenceferreiro.github.io/postman-api-tests/**

Отчёт содержит:
- Статус прохождения тестов
- Время выполнения
- Детальные шаги и проверки
- Графики и историю

---

## 📁 Коллекции тестов

| Файл | Описание |
|------|----------|
| `my-collection.json` | Основная коллекция (GET, POST запросы) |
| `Auth Tests.json` | Тесты авторизации и Bearer Token |
| `Login Tests.postman_collection.json` | Отдельные тесты логина |
| `simple-test.json` | Простой тест для отладки |

---

## ⚙️ Технологии

| Инструмент | Назначение |
|------------|------------|
| Postman | Разработка тестов |
| Newman | Запуск тестов из CLI |
| GitHub Actions | CI/CD автоматизация |
| Allure Report | Визуализация результатов |
| GitHub Pages | Хостинг отчётов |

## 🔄 CI/CD Pipeline

1. **Push** в репозиторий
2. **GitHub Actions** запускает workflow
3. **Newman** выполняет тесты
4. **Allure** генерирует отчёт
5. **GitHub Pages** публикует отчёт

---

## 📈 Статус проекта

✅ Тесты проходят успешно  
✅ Отчёты обновляются автоматически  
✅ CI/CD полностью настроен  

---

## 📝 Планы развития

- [x] Postman + Newman
- [x] GitHub Actions CI/CD
- [x] Allure Report
- [ ] TypeScript + Supertest
- [ ] Playwright E2E тесты

---

## 🔗 Полезные ссылки

- [Allure Report (актуальный)](https://clarenceferreiro.github.io/postman-api-tests/)
- [GitHub Actions (история запусков)](https://github.com/ClarenceFerreiro/postman-api-tests/actions)
- [Репозиторий на GitHub](https://github.com/ClarenceFerreiro/postman-api-tests)

---

*Автотесты для API — демонстрация навыков автоматизации тестирования*
