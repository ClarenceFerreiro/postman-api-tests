# Postman API Tests

[![CI Status](https://github.com/ClarenceFerreiro/postman-api-tests/actions/workflows/allure-report.yml/badge.svg)](https://github.com/ClarenceFerreiro/postman-api-tests/actions)
[![Allure Report](https://img.shields.io/badge/📊-Allure%20Report-blue)](https://clarenceferreiro.github.io/postman-api-tests/)

Автотесты для REST API с использованием **Postman**, **Newman**, **GitHub Actions** и **Allure Report**.

---

## 📋 О проекте

Проект демонстрирует навыки автоматизации тестирования API. Тесты написаны в Postman, запускаются через Newman в CI/CD пайплайне GitHub Actions, а отчёты публикуются на GitHub Pages с визуализацией в Allure.

---

## 🧪 Что тестируется

- **GET /posts/1** — проверка статуса 200, ID, типа данных полей
- **POST /posts** — создание нового поста
- **Авторизация** — Bearer Token, получение и передача токена

---

## 🚀 Запуск тестов

### Локально (требуется Node.js)

```bash
# Установка Newman
npm install -g newman

# Запуск коллекции
newman run my-collection.json
