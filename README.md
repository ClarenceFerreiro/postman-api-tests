# Postman API Tests

Мои автотесты для API.

## Содержание

- `my-collection.json` - коллекция тестов Postman

## Что тестируется

- GET `/posts/1` - проверка статуса, ID, типов данных
- GET `/posts/999` - проверка 404
- POST `/posts` - создание поста

## Запуск тестов

1. Импортировать `my-collection.json` в Postman
2. Запустить коллекцию через Collection Runner

## Результаты

✅ 9 из 9 тестов проходят успешно
