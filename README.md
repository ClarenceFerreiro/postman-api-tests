![CI Status](https://github.com/ClarenceFerreiro/postman-api-tests/actions/workflows/test.yml/badge.svg)

# Postman API Tests

Мои автотесты для API в Postman. Демонстрация навыков автоматизации тестирования REST API.

---

## 📁 Коллекции тестов

| Файл | Описание | Кол-во тестов |
|------|----------|---------------|
| `my-collection.json` | Базовые тесты для JSONPlaceholder | ✅ 9 |
| `Auth Tests.json` | Тестирование авторизации (Bearer Token) | ✅ 7 |
| `Login Tests.postman_collection.json` | Отдельные тесты логина | ✅ 2 |

## ✅ Что тестируется

### Базовая коллекция (JSONPlaceholder)
- `GET /posts/1` — статус 200, ID=1, типы данных, Content-Type
- `GET /posts/999` — проверка 404 Not Found
- `POST /posts` — создание нового поста

### Авторизация (Postman Echo + Mock)
- `POST /login` — получение токена
- `GET /user` (с токеном) — успешный доступ, проверка токена
- `GET /user` (без токена) — публичный эндпоинт, отсутствие токена

## 🚀 Запуск тестов

### В Postman
1. Импортируйте нужный `.json` файл
2. Откройте коллекцию → **Run**
3. Выберите запросы и нажмите **Run**

### Через Newman (CLI)
```bash
newman run my-collection.json
