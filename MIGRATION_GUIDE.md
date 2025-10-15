# 🚀 План миграции на Next.js

## 📁 Структура проекта после миграции

```
my-app/
├── server/                  # ✅ СОЗДАН - Express сервер
│   ├── controllers/
│   ├── routes/
│   ├── index.js
│   └── package.json
├── src/                     # Текущий React код (будет мигрирован)
└── next-app/               # 🔜 СОЗДАТЬ - Next.js приложение
    ├── pages/
    ├── components/
    ├── redux/
    └── package.json
```

---

## ✅ Что уже сделано

1. **Создана папка `server/`** с полной структурой Express сервера
2. **Настроены роуты** для пользователей, целей и достижений
3. **Созданы контроллеры** с заглушками (можно подключить БД позже)
4. **API полностью совместим** с вашим текущим `Api.js`

---

## 📋 Пошаговый план миграции

### Шаг 1: Установить зависимости сервера

```bash
cd server
npm install
```

### Шаг 2: Запустить сервер

```bash
# Development режим с автоперезагрузкой
npm run dev

# Или обычный запуск
npm start
```

Сервер будет доступен на `http://localhost:5002`

---

### Шаг 3: Создать Next.js приложение

**Вариант A: Создать новое приложение (РЕКОМЕНДУЕТСЯ)**

```bash
# В корне my-app/
npx create-next-app@latest next-app

# При установке выберите:
# ✅ TypeScript? No (или Yes, если хотите)
# ✅ ESLint? Yes
# ✅ Tailwind CSS? Yes (опционально)
# ✅ `src/` directory? Yes
# ✅ App Router? Yes (новый роутер Next.js 13+)
# ✅ Turbopack? Yes
```

**Вариант B: Конвертировать текущий проект**

Если хотите сохранить текущую структуру, потребуется:
1. Установить Next.js в текущий проект
2. Настроить `next.config.js`
3. Переименовать компоненты согласно структуре Next.js

---

### Шаг 4: Мигрировать компоненты

#### 4.1 Структура страниц в Next.js

```
next-app/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.js          # Главный layout (вместо App.js)
│   ├── page.js            # Главная страница (/)
│   ├── profile/
│   │   └── page.js        # /profile
│   ├── goals/
│   │   └── page.js        # /goals
│   └── achievements/
│       └── page.js        # /achievements
├── components/            # Все ваши компоненты
│   ├── Profile/
│   ├── Goals/
│   └── Achievements/
└── redux/                 # Redux store
```

#### 4.2 Перенести компоненты

```bash
# Скопировать компоненты
cp -r src/Component next-app/components

# Скопировать Redux
cp -r src/redux next-app/redux

# Скопировать utils
cp -r src/utils next-app/utils

# Скопировать API
cp -r src/Api next-app/lib/api
```

---

### Шаг 5: Настроить Redux для Next.js

Создать `next-app/redux/provider.js`:

```javascript
'use client'
import { Provider } from 'react-redux'
import store from './store_redux'

export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>
}
```

Обновить `next-app/app/layout.js`:

```javascript
import { ReduxProvider } from '@/redux/provider'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
```

---

### Шаг 6: Обновить API для Next.js

В `next-app/lib/api/Api.js` изменить BASE_URL:

```javascript
// Если сервер на том же хосте:
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Или использовать Next.js API Routes:
const BASE_URL = '/api';
```

---

### Шаг 7: Настроить маршрутизацию

**Текущие маршруты:**
- `/Motivation` → `/profile`
- `/goals` → `/goals`
- `/achievements` → `/achievements`

**Next.js App Router:**

Создать файлы:
- `app/profile/page.js` - страница профиля
- `app/goals/page.js` - страница целей  
- `app/achievements/page.js` - страница достижений

---

### Шаг 8: Обновить навигацию

В `BottomNav.jsx` заменить `react-router-dom` на Next.js:

```javascript
// Было:
import { useNavigate } from 'react-router-dom';

// Стало:
import { useRouter } from 'next/navigation';

// Использование:
const router = useRouter();
router.push('/profile');
```

---

### Шаг 9: Настроить переменные окружения

Создать `next-app/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5002/api
NEXT_PUBLIC_TELEGRAM_BOT_NAME=your_bot_name
```

---

### Шаг 10: Запустить проекты одновременно

**Терминал 1 - Сервер:**
```bash
cd server
npm run dev
```

**Терминал 2 - Next.js:**
```bash
cd next-app
npm run dev
```

---

## 🎯 Альтернатива: Next.js API Routes (без отдельного сервера)

Можно интегрировать API прямо в Next.js:

```
next-app/
├── app/
│   └── api/
│       ├── users/
│       │   └── route.js
│       ├── goals/
│       │   └── route.js
│       └── achievements/
│           └── route.js
```

Пример `app/api/users/route.js`:

```javascript
export async function POST(request) {
  const body = await request.json();
  // Ваша логика
  return Response.json({ success: true, data: body });
}

export async function GET(request) {
  // Ваша логика
  return Response.json({ users: [] });
}
```

---

## 🔧 Дополнительные настройки

### Настроить `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['t.me', 'i.postimg.cc'], // Для загрузки изображений
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5002/api/:path*', // Прокси на Express
      },
    ];
  },
}

module.exports = nextConfig
```

---

## 📦 Установка зависимостей для Next.js

```bash
cd next-app
npm install axios react-redux @reduxjs/toolkit framer-motion react-hot-toast
```

---

## ✅ Чеклист миграции

- [ ] Установить зависимости сервера
- [ ] Запустить Express сервер
- [ ] Создать Next.js приложение
- [ ] Перенести компоненты
- [ ] Настроить Redux Provider
- [ ] Обновить API клиент
- [ ] Создать страницы в App Router
- [ ] Обновить навигацию
- [ ] Настроить переменные окружения
- [ ] Протестировать все функции

---

## 🚨 Важные моменты

1. **Client Components** - компоненты с хуками (`useState`, `useEffect`) должны иметь `'use client'` в начале файла
2. **Server Components** - по умолчанию в Next.js 13+ все компоненты серверные
3. **Routing** - используйте файловую систему для маршрутов
4. **API** - можно использовать встроенные API Routes или внешний Express сервер

---

## 📞 Следующие шаги

1. Запустить сервер и убедиться, что он работает
2. Создать Next.js приложение
3. Начать миграцию компонентов постепенно
4. Тестировать каждую часть отдельно

---

**Хотите, чтобы я помог создать Next.js приложение и начать миграцию?**
