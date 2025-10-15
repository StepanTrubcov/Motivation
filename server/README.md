# Motivation App - Server

## Установка

```bash
cd server
npm install
```

## Запуск

### Development режим с hot reload:
```bash
npm run dev
```

### Production режим:
```bash
npm start
```

## API Endpoints

### Users
- `POST /api/users` - Создать/обновить пользователя
- `GET /api/users/:telegramId` - Получить пользователя
- `POST /api/users/:userId/pts/increment` - Добавить очки
- `POST /api/users/:userId/completed-dates` - Добавить дату выполнения
- `GET /api/users/:userId/completed-dates` - Получить даты

### Goals
- `GET /api/goals/:userId` - Получить цели пользователя
- `PUT /api/goals/:userId/:goalId` - Обновить статус цели
- `POST /api/check-completion/:userId` - Проверить завершение

### Achievements
- `POST /api/generate-report/:telegramId` - Генерация отчёта
- `POST /api/achievement/share` - Создать share-карточку

## Environment Variables

Создайте файл `.env` на основе `.env.example`

```
PORT=5002
NODE_ENV=development
```

## TODO

- [ ] Подключить реальную БД (PostgreSQL/MongoDB)
- [ ] Добавить аутентификацию
- [ ] Добавить валидацию данных
- [ ] Реализовать генерацию отчётов через AI
- [ ] Реализовать генерацию share-картинок
