import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function createImageAndShare({ title, description, username, points }) {
  try {
    // 1) создаём картинку на сервере; передаём нормальные строки, НЕ encodeURIComponent(...)
    const res = await axios.post(`${BASE_URL}/api/og-image`, {
      title,
      description,
      username,
      points: String(points ?? 0),
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const imageUrl = res.data?.url;
    if (!imageUrl) throw new Error('No image URL from server');

    // 2) пытаемся поделиться как файлом (лучше всего для Stories/Instagram)
    // Получаем blob
    const fetchRes = await fetch(imageUrl);
    if (!fetchRes.ok) throw new Error('Failed to fetch generated image');
    const blob = await fetchRes.blob();

    // Создаём File (некоторые браузеры/ios требуют расширение)
    const file = new File([blob], 'achievement.png', { type: blob.type || 'image/png' });

    // Текст, который хотим показать при шаринге — уже декодированный
    const shareText = `${title}\n\n${description}`;

    // Если браузер поддерживает шаринг файлов
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        text: shareText,
        title: title,
        // url: imageUrl // можно указать, но не обязательно
      });
      return;
    }

    // fallback: используем стандартный share (ссылка + текст)
    if (navigator.share) {
      await navigator.share({
        title,
        text: shareText,
        url: imageUrl
      });
      return;
    }

    // fallback 2: просто открываем картинку в новой вкладке (пользователь вручную сохранит/поделится)
    window.open(imageUrl, '_blank', 'noopener');

  } catch (err) {
    console.error('Share error', err);
    // можно показать пользователю сообщение об ошибке
    alert('Не удалось поделиться. Попробуйте скачать картинку.');
  }
}

// Функция для генерации изображения и получения URL
export async function generateImage({ title, description, username, points }) {
  try {
    // создаём картинку на сервере; передаём нормальные строки, НЕ encodeURIComponent(...)
    const res = await axios.post(`${BASE_URL}/api/og-image`, {
      title,
      description,
      username,
      points: String(points ?? 0),
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const imageUrl = res.data?.url;
    if (!imageUrl) throw new Error('No image URL from server');

    return imageUrl;
  } catch (err) {
    console.error('Generate image error', err);
    throw err;
  }
}