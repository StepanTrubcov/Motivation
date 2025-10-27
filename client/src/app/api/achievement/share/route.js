import { NextResponse } from 'next/server';
import { createCanvas } from '@napi-rs/canvas';

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    try {
      const width = 1200;
      const height = 630;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Фон
      ctx.fillStyle = '#0b0b0b';
      ctx.fillRect(0, 0, width, height);

      // Используем только базовые шрифты без регистрации
      ctx.fillStyle = '#00ff99';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`@${username || 'user'}`, 80, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px sans-serif';

      // Ограничиваем длину заголовка
      const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
      ctx.fillText(shortTitle, 80, 200);

      // Описание с ограничением
      ctx.font = '34px sans-serif';
      ctx.fillStyle = '#ffffff';
      const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;

      // Простой перенос строк
      const lines = [];
      let currentLine = '';
      const words = shortDesc.split(' ');

      for (const word of words) {
        const testLine = currentLine + word + ' ';
        if (testLine.length > 40) { // Примерное ограничение по символам
          lines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Рисуем линии описания
      let y = 270;
      for (const line of lines.slice(0, 3)) { // Максимум 3 строки
        ctx.fillText(line.trim(), 80, y);
        y += 45;
      }

      // Очки
      ctx.fillStyle = '#00ff99';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(`+${points || 0} очков`, 80, y + 30);

      // Цитата
      const quotes = [
        '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
        '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
        '«Дисциплина сильнее мотивации ⚡️»',
        '«Начни сейчас. Идеального момента не будет ⏳»',
        '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      ctx.font = 'italic 30px sans-serif';
      ctx.fillStyle = '#9b9b9b';

      // Обрезаем длинную цитату
      const shortQuote = randomQuote.length > 60 ? randomQuote.substring(0, 60) + '...' : randomQuote;
      ctx.fillText(shortQuote, 80, height - 60);

      const buffer = canvas.toBuffer('image/png');
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

      return generateSimpleSVG(title, description, points, username);
    } catch (canvasError) {
      console.error('Canvas error:', canvasError);
      // Всегда возвращаем SVG fallback
      return generateSimpleSVG(title, description, points, username);
    }
  } catch (error) {
    console.error('❌ Ошибка генерации share-картинки:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка генерации изображения',
      url: null,
    }, { status: 500 });
  }
}

function generateSimpleSVG(title, description, points, username) {
  const quotes = [
    '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
    '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
    '«Дисциплина сильнее мотивации ⚡️»',
    '«Начни сейчас. Идеального момента не будет ⏳»',
    '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
  const shortDesc = description.length > 80 ? description.substring(0, 80) + '...' : description;
  const shortQuote = randomQuote.length > 70 ? randomQuote.substring(0, 70) + '...' : randomQuote;

  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0b0b0b"/>
      <text x="80" y="100" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="#00ff99">@${username || 'user'}</text>
      <text x="80" y="200" font-family="system-ui, sans-serif" font-size="80" font-weight="bold" fill="#ffffff">${shortTitle}</text>
      <text x="80" y="270" font-family="system-ui, sans-serif" font-size="34" fill="#ffffff">${shortDesc}</text>
      <text x="80" y="350" font-family="system-ui, sans-serif" font-size="40" font-weight="bold" fill="#00ff99">+${points || 0} очков</text>
      <text x="80" y="570" font-family="system-ui, sans-serif" font-size="30" font-style="italic" fill="#9b9b9b">${shortQuote}</text>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  return NextResponse.json({
    success: true,
    url: dataUrl,
  });
}