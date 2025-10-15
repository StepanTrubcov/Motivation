# 🎯 Motivation App - Monorepo

Мотивационное приложение для отслеживания целей и достижений.

## 📁 Структура проекта

```
my-app/
├── server/          # Express API сервер (✅ ГОТОВ)
├── src/             # Старый React код (CRA)
├── next-app/        # Next.js приложение (🔜 СОЗДАТЬ)
└── public/          # Статические файлы
```

---

## 🚀 Быстрый старт

### 1. Запустить сервер

```bash
cd server
npm install
npm run dev
```

Сервер будет доступен на: `http://localhost:5002`

### 2. Создать Next.js приложение

```bash
# В корне проекта
npx create-next-app@latest next-app
```

### 3. Запустить старое React приложение (пока не мигрировали)

```bash
npm start
```

---

## 📚 Документация

- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Полное руководство по миграции на Next.js
- **[server/README.md](./server/README.md)** - Документация по серверу

---

## 🛠 Доступные команды

### Сервер
```bash
npm run dev:server     # Запустить сервер в dev режиме
npm run start:server   # Запустить сервер в production
```

### Клиент (после создания next-app)
```bash
npm run dev:client     # Запустить Next.js в dev режиме
npm run build:client   # Собрать Next.js для production
npm run start:client   # Запустить Next.js production сервер
```

### Оба одновременно
```bash
npm run dev           # Запустить сервер и клиент параллельно
```

### Старое приложение
```bash
npm run old:start     # Запустить старое CRA приложение
npm run old:build     # Собрать старое приложение
```

---

## 🔧 Технологии

### Backend
- Node.js + Express
- CORS
- Axios

### Frontend (планируется)
- Next.js 14+ (App Router)
- React 19
- Redux Toolkit
- Framer Motion
- React Hot Toast
- Telegram Web App SDK

---

## 📝 TODO

- [ ] Создать Next.js приложение
- [ ] Мигрировать компоненты из `src/` в `next-app/`
- [ ] Настроить Redux для Next.js
- [ ] Обновить роутинг
- [ ] Подключить БД к серверу (PostgreSQL/MongoDB)
- [ ] Добавить TypeScript (опционально)
- [ ] Настроить CI/CD

---

## 🎯 Следующие шаги

1. Прочитайте [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. Установите зависимости сервера: `cd server && npm install`
3. Запустите сервер: `npm run dev`
4. Создайте Next.js приложение
5. Начните миграцию компонентов

---

## 📞 Поддержка

Если возникли вопросы по миграции, обратитесь к руководству или документации Next.js.

---

**Удачи с миграцией! 🚀**
