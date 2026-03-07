# Промпт для картинки загрузки (светлая тема)

Скопируй этот промпт в генератор изображений (Cursor, DALL·E, SeaArt, Midjourney и т.п.), сгенерируй картинку и сохрани её в эту папку как **`loading-light.webp`** (или `loading-light.png` — тогда в коде поменяй расширение).

---

**Промпт (англ.):**

```
Motivational mobile app loading screen for LIGHT theme. Bright, soft image: clean white and cream background, gentle mint green and sage accents. One subtle element: a small green plant growing up or a single leaf, minimal flat illustration style. Mood: calm, discipline, daily goals, progress. No dark areas, no neon, no text. Professional and uplifting. Vertical format 9:16 for smartphone fullscreen background.
```

**Краткий вариант:**

```
Light theme app background. Soft white and mint green, minimal green plant or leaf, flat design, no text, vertical phone screen, motivational calm mood.
```

---

**Что сделать после генерации:**
1. Сохрани изображение в папку `client/public/`
2. Назови файл **`loading-light.webp`** (или `.png`)
3. Если использовал .png — в `LoadingScreen.jsx` замени `LIGHT_IMAGE_URL = "/loading-light.webp"` на `"/loading-light.png"`
