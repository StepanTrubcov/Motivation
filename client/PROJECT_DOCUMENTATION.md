# Документация проекта Motivation App

## Обзор

**Motivation App** — веб-приложение для Telegram (Telegram Mini App), предназначенное для постановки и отслеживания целей, накопления очков, получения достижений и формирования отчётов за день/неделю.

- **Стек:** Next.js 16, React 19, Redux Toolkit, Prisma, PostgreSQL
- **Платформа:** Telegram Web App (подключается через `@twa-dev/sdk` и скрипт `telegram-web-app.js`)
- **Язык интерфейса:** русский

---

## Структура проекта

```
client/
├── prisma/
│   └── schema.prisma          # Схема БД (User, Goal, Achievement)
├── scripts/                    # Скрипты бэкапа/восстановления БД и postinstall
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (REST)
│   │   ├── profile/            # Страница профиля
│   │   ├── goals/              # Страница целей
│   │   ├── achievements/       # Страница достижений
│   │   ├── layout.js           # Корневой layout (Redux, BottomNav, DataInitializer)
│   │   ├── page.js             # Главная (редирект на профиль)
│   │   └── globals.css
│   ├── components/             # React-компоненты
│   │   ├── Profile/            # Профиль, цели на сегодня, календарь, генерация отчётов
│   │   ├── Goals/              # Управление целями
│   │   ├── Achievements/       # Достижения и карта достижений
│   │   ├── BottomNav/          # Нижняя навигация
│   │   ├── DataInitializer/    # Инициализация данных при старте
│   │   └── LoadingScreen/
│   ├── context/                # React Context (BottomNavContext)
│   ├── lib/                    # API-клиент, Prisma, валидация Telegram
│   ├── redux/                  # Store и редьюсеры
│   └── utils/                  # Утилиты (модалки, фильтры, проверки, отчёты)
├── next.config.js
├── server.js                   # Express-сервер (опционально)
└── package.json
```

---

## База данных (Prisma)

### Модели

- **User**
  - `id`, `telegramId` (уникальный), `firstName`, `username`, `photoUrl`, `pts` (очки), `savingGoals` (JSON), `usersTag`, `registrationDate`, связи с `goals` и `achievements`.

- **Goal**
  - `id`, `title`, `points`, `status` (not_started | in_progress | completed), `category` (Sport | Discipline | Self_development | Spirituality), `progress`, `completionDate`, `description`, `userId`, `startDate`, `selectedOption`.

- **Achievement**
  - `id`, `title`, `gif`, `rarity`, `description`, `requirement`, `status`, `image`, `points`, `type`, `goalIds`, `target`, `userId`.

Подключение к БД задаётся переменной окружения `DIRECT_DATABASE_URL` (PostgreSQL).

---

## Состояние приложения (Redux)

- **profile** — текущий пользователь (`profile`), флаг первого входа (`theFirstTime`). Загрузка через `addProfile()` (API профиля + цели).
- **goals** — список целей (`goals`), флаг загрузки целей (`ThereAreUsers`), время сохранения целей (`timeGoalsSaving`). Обновление статусов целей, сохранение целей на день (saving goals).
- **assignments** — достижения (`assignments`), флаг загрузки (`assignmentsLoaded`). Инициализация и обновление достижений.
- **generation** — текст сгенерированного отчёта (`generationText`, `generationTextYesterday`), флаги завершения генерации.

Глобальный store доступен в dev как `window.store` (для отладки).

---

## Инициализация приложения

1. **Layout** (`layout.js`): подключает `ReduxProvider`, `BottomNavProvider`, `Toaster`, `DataInitializer`, `BottomNavWrapper`. Для Telegram принудительно выставляется тёмная тема (`telegram-dark`).
2. **DataInitializer**: после монтирования:
   - вызывает `addProfile()` (создание/обновление пользователя по данным Telegram);
   - при наличии пользователя загружает цели и проверяет сохранённые цели по времени (`checkTimeGoalsSaving`, `addGoals`, `addStatus`);
   - инициализирует достижения (`getInitializeAchievementsData`);
   - после загрузки профиля, целей и достижений показывает нижнюю навигацию и запускает проверку достижений (`checkAll`).
3. Пока данные не готовы, показывается `LoadingScreen` с сообщениями «Загрузка данных пользователя...», «Загрузка целей...», «Загрузка достижений...».

---

## API (Next.js Route Handlers)

Базовый путь: `/api`. В разработке при необходимости используется `NEXT_PUBLIC_API_URL`.

| Назначение | Маршрут | Методы |
|------------|---------|--------|
| Пользователи | `/api/users` | POST (создание/обновление по Telegram) |
| | `/api/users/all-ids` | GET |
| | `/api/users/[id]/pts/increment` | POST (добавить очки), DELETE (убрать очки) |
| | `/api/users/[id]/completed-dates` | GET, POST, DELETE |
| | `/api/users/[id]/achievements` | GET |
| | `/api/users/[id]/achievements/[achievementId]/status` | PATCH |
| Цели | `/api/goals/[userId]` | GET |
| | `/api/goals/[userId]/[goalId]` | PATCH (статус цели) |
| | `/api/initialize-goals/[userId]` | POST |
| | `/api/check-completion/[userId]` | GET |
| | `/api/custom-goals` | POST |
| Сохранённые цели на день | `/api/saving-goals` | GET, POST и др. (объёмная логика) |
| | `/api/saving-goals/remove-today` | POST |
| Достижения | `/api/update-achievements` | POST |
| | `/api/update-all-achievements` | POST |
| | `/api/achievement/image` | Генерация изображения достижения |
| | `/api/achievement/share` | Шаринг достижения |
| Прочее | `/api/og-image` | OG-изображение |
| | `/api/generate-report/[telegramId]` | Генерация отчёта |

Валидация Telegram Web App выполняется через `telegramValidation.js` (проверка `initData` по bot token).

---

## Клиент API (`src/lib/api/Api.js`)

- Работа с профилем: `addProfileApi()` (данные из `WebApp.initDataUnsafe.user`).
- Цели: `getAllGoals`, `getAllStatus`, `checkGoalCompletion`, `initializeUserGoals`, `addCustomGoal`.
- Очки: `addPoints`, `removePoints`.
- Календарь выполненных дней: `addCompletedDate`, `deleteCompletedDate`, `getCompletedDates`.
- Достижения: `initializeAchievements`, `getAchievements`, `achievementNewStatus`, `makingPicture`, `getMakingPicture`, `clearAchievementImages`.
- Сохранённые цели (saving goals): `addSavingGoal`, `getUserSavingGoals`, `getUserSavingGoalsWithAutoPeriod`, `updateUserSavingGoals`, `generateSavingGoalsReport`, `updateSavingGoalStatus`, `removeUserSavingGoalByIndex`, `removeSavingGoalFromToday`.
- Генерация текста отчёта: используется в `generation_reducer` (например, `getGeneraleText`).

`BASE_URL` в браузере — `process.env.NEXT_PUBLIC_API_URL || '/api'`, на сервере — `'/api'`.

---

## Страницы и навигация

- **/** — главная; при загрузке вызывается `addProfile()`, рендерится `ProfileConteiner`.
- **/profile** — профиль: `ProfileConteiner` + нижняя навигация.
- **/goals** — цели: компоненты целей + нижняя навигация.
- **/achievements** — достижения: карта достижений и модалки + нижняя навигация.

Нижняя навигация (`BottomNav`): Профиль (Home), Цели (Bars), Достижения (Trophy). Видимость управляется через `BottomNavContext` после инициализации данных.

---

## Профиль (Profile)

- **MonthlyPointsScale** — шкала очков за месяц.
- **ProfileInfo** — информация о пользователе (аватар, имя, тег, элементы вроде Lights, WinterArc, QuestionButton).
- **TodaysGoals** — цели на сегодня (в т.ч. сохранённые цели).
- **GenerationButton** — кнопка генерации отчёта (модалки с текстом/настройками).
- **ContributionCalendar** — календарь активностей (по выполненным дням).
- **Yesterday** — блок «Вчера» и переключение отображения основного контента.

Данные профиля и целей берутся из Redux (`profile`, `goals`).

---

## Цели (Goals)

- Список целей с категориями (Sport, Discipline, Self_development, Spirituality).
- Обновление статуса: not_started → in_progress → completed (через API и `addStatusNew`).
- Добавление пользовательских целей (`addCustomGoal`, API `custom-goals`).
- Сохранённые цели на день (saving goals) синхронизируются с API `saving-goals` и локальным состоянием.

---

## Достижения (Achievements)

- Инициализация при первом входе (`initializeAchievements`), обновление статусов при выполнении условий (`checkAll` в `DataInitializer`).
- Карта достижений (`AchievementsMap`), модалки деталей и «моё достижение» (`ModalWindowMe`, `ModalWindowAchievements`).
- Генерация изображений для шаринга (`/api/achievement/image`, `/api/achievement/share`).

---

## Генерация отчётов

- API: `/api/generate-report/[telegramId]` — формирование отчёта за период.
- В Redux: `generation_reducer` хранит текст отчёта за сегодня и за вчера; экшены типа `addTextGenerationData` вызывают `getGeneraleText` и обновляют store и UI (кнопка генерации, модалки).

---

## Стили и темы

- Глобальные стили: `App.css`, `index.css`, `globals.css`.
- Модульные стили: `*.module.css` рядом с компонентами.
- Для Telegram всегда применяется класс `telegram-dark` (тёмная тема).

---

## Переменные окружения

- `DIRECT_DATABASE_URL` — строка подключения PostgreSQL для Prisma.
- `NEXT_PUBLIC_API_URL` — базовый URL API (в dev может указывать на другой хост).
- Для валидации Telegram и ботов используется bot token (см. использование в `telegramValidation.js` и API routes).

---

## Скрипты (package.json)

- `npm run dev` — запуск Next.js в режиме разработки.
- `npm run build` — сборка.
- `npm run start` — запуск после сборки.
- `npm run serve` — запуск `server.js` (Express).
- `npm run backup` — бэкап Prisma/БД (скрипты в `scripts/`).
- `npm run restore` — восстановление из бэкапа.
- `npm run list-backups` — список бэкапов.
- `postinstall` — `npx prisma generate` и `node scripts/postinstall.js`.

---

## Зависимости (основные)

- **Next.js 16**, **React 19** — ядро приложения.
- **@reduxjs/toolkit**, **react-redux** — состояние.
- **@twa-dev/sdk** — Telegram Web App.
- **@prisma/client** — работа с БД.
- **axios** — HTTP-запросы к API.
- **framer-motion**, **lucide-react**, **react-icons** — UI и анимации.
- **react-hot-toast** — уведомления.
- **formik** — формы (при необходимости).
- **@vercel/blob**, **@vercel/og** — хранилище и OG-изображения.
- **node-cron** — отложенные/периодические задачи (в `scheduled-tasks.js`).

---

## Краткий чеклист для разработки

1. Настроить `DIRECT_DATABASE_URL` и при необходимости `NEXT_PUBLIC_API_URL`.
2. Выполнить `npm install` (Prisma generate и postinstall запустятся автоматически).
3. При необходимости применить миграции Prisma к БД.
4. Запустить `npm run dev` и открыть приложение в Telegram или в браузере с тестовыми данными.
5. Профиль и цели подтягиваются из Telegram `initData`; для теста без Telegram можно подставить тестового пользователя в `addProfileApi`.

Документация актуальна по состоянию структуры и кода в репозитории.
