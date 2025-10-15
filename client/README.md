# 🎯 Motivation App - Next.js + Express

Полностью мигрированное приложение на Next.js с Express backend в одной папке.

---

## 📁 Структура проекта

```
my-app/
├── server/              # Express API сервер
│   ├── src/
│   │   ├── index.js    # Главный файл сервера
│   │   └── prismaClient.js
│   ├── prisma-mongo/   # MongoDB схема Prisma
│   ├── prisma-postgres/ # PostgreSQL схема Prisma
│   ├── package.json
│   └── .env
│
├── client/              # Next.js приложение
│   ├── src/
│   │   ├── app/        # Next.js App Router
│   │   │   ├── layout.js
│   │   │   ├── page.js
│   │   │   ├── profile/
│   │   │   ├── goals/
│   │   │   └── achievements/
│   │   ├── components/ # Все React компоненты
│   │   ├── redux/      # Redux store
│   │   ├── lib/api/    # API клиент
│   │   ├── utils/      # Утилиты
│   │   └── styles/     # CSS файлы
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   └── .env.local
│
├── src/                 # Старый React код (можно удалить)
└── package.json         # Корневой package.json
```

---

## 🚀 БЫСТРЫЙ ЗАПУСК

### 1️⃣ Запустить сервер

```bash
cd server
npm install  # Если ещё не установлены зависимости
npm run dev  # Запуск в dev режиме с nodemon
```

✅ Сервер запустится на **http://localhost:5002**

### 2️⃣ Запустить Next.js клиент

**В новом терминале:**

```bash
cd client
npm install  # Если ещё не установлены зависимости
npm run dev  # Запуск в dev режиме
```

✅ Next.js запустится на **http://localhost:3000**

---

## 🎉 Готово!

Откройте браузер и перейдите на **http://localhost:3000**

Приложение автоматически перенаправит вас на страницу профиля.

---

## 📖 Доступные страницы

- **`/profile`** - Страница профиля с целями на сегодня
- **`/goals`** - Все доступные цели
- **`/achievements`** - Достижения пользователя

---

## 🔧 Что изменилось при миграции

### ✅ Next.js App Router

- Использован новый App Router (Next.js 13+)
- Файловая система для роутинга
- Server Components по умолчанию, Client Components где нужно

### ✅ Навигация

**Было (React Router):**
```javascript
import { Link, useNavigate } from 'react-router-dom';

<Link to="/profile">Profile</Link>
navigate('/goals');
```

**Стало (Next.js):**
```javascript
import Link from 'next/link';
import { useRouter } from 'next/navigation';

<Link href="/profile">Profile</Link>
router.push('/goals');
```

### ✅ Redux интеграция

Создан `ReduxProvider` для работы с Next.js:

```javascript
'use client';
import { Provider } from 'react-redux';
import store from './store_redux';

export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
```

### ✅ Client Components

Все компоненты, использующие хуки React, помечены `'use client'`:

```javascript
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(0);
  // ...
}
```

### ✅ API клиент

Обновлён `Api.js` для работы с переменными окружения Next.js:

```javascript
const BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api')
  : 'http://localhost:5002/api';
```

---

## 🌐 API Endpoints

Сервер предоставляет следующие API:

### Пользователи
- `POST /api/users` - Создать/обновить пользователя
- `POST /api/users/:userId/pts/increment` - Добавить очки
- `POST /api/users/:userId/completed-dates` - Добавить дату выполнения
- `GET /api/users/:userId/completed-dates` - Получить даты

### Цели
- `GET /api/goals/:userId` - Получить цели пользователя
- `POST /api/initialize-goals/:userId` - Инициализировать цели
- `PUT /api/goals/:userId/:goalId` - Обновить статус цели
- `POST /api/check-completion/:userId` - Проверить завершение целей

### Достижения
- `POST /api/users/:userId/achievements` - Создать достижения
- `GET /api/users/:userId/achievements` - Получить достижения
- `PUT /api/users/:userId/achievements/:achievementId/status` - Обновить статус

### Отчёты
- `POST /api/generate-report/:telegramId` - Генерация отчёта
- `POST /api/achievement/share` - Создать share-карточку

---

## 🔑 Переменные окружения

### Server (`.env`)

```env
MONGODB_URL='your_mongodb_url'
DATABASE_URL='your_postgres_url'
DIRECT_DATABASE_URL='your_direct_postgres_url'
PORT=5002
```

### Client (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

---

## 📦 Зависимости

### Server
- Express - Web фреймворк
- Prisma - ORM для MongoDB и PostgreSQL
- Canvas - Генерация изображений
- Axios - HTTP клиент
- CORS - Cross-Origin Resource Sharing

### Client
- Next.js 15 - React фреймворк
- React 19 - UI библиотека
- Redux Toolkit - State management
- Framer Motion - Анимации
- React Hot Toast - Уведомления
- Axios - HTTP клиент
- Telegram Web App SDK - Интеграция с Telegram

---

## 🛠 Команды для разработки

### Server
```bash
cd server
npm run dev      # Запуск с hot reload (nodemon)
npm start        # Запуск в production
npm run build    # Установка зависимостей
```

### Client
```bash
cd client
npm run dev      # Запуск в dev режиме
npm run build    # Сборка для production
npm start        # Запуск production сервера
npm run lint     # Проверка кода
```

---

## 🎨 Стили

Все CSS модули сохранены в исходном виде:
- CSS Modules (`.module.css`)
- Глобальные стили в `src/styles/`

---

## 📱 Telegram Web App

Приложение поддерживает работу как Telegram Mini App:

```javascript
import WebApp from '@twa-dev/sdk';

WebApp.ready();
const userData = WebApp.initDataUnsafe?.user;
```

---

## 🚧 TODO

- [ ] Настроить production деплой
- [ ] Добавить мобильную адаптацию
- [ ] Оптимизировать загрузку изображений
- [ ] Добавить тесты
- [ ] Настроить CI/CD

---

## 📞 Поддержка

Если возникли проблемы:

1. Убедитесь, что оба сервера запущены (server и client)
2. Проверьте порты (5002 для server, 3000 для client)
3. Проверьте переменные окружения
4. Очистите кэш: `rm -rf client/.next && rm -rf client/node_modules/.cache`

---

## 🎯 Отличия от старой версии (CRA)

| Функция | Create React App | Next.js |
|---------|------------------|---------|
| Роутинг | React Router | Next.js App Router |
| Навигация | `<Link to>` | `<Link href>` |
| SSR | Нет | Да |
| API Routes | Нет | Да (опционально) |
| Оптимизация | Базовая | Автоматическая |
| Сборка | Долгая | Быстрая (Turbopack) |

---

**Приложение полностью готово к работе! 🚀**
