import { NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

// Регистрируем системные шрифты или используем встроенные
async function registerFonts() {
  try {
    // Попробуем использовать встроенные шрифты
    // В Vercel среда Linux, поэтому используем стандартные шрифты
    GlobalFonts.registerFromPath('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 'Arial');
    GlobalFonts.registerFromPath('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 'Arial', { weight: 'bold' });
    GlobalFonts.registerFromPath('/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf', 'Arial', { style: 'italic' });
  } catch (error) {
    console.log('Using default fonts');
  }
}

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    try {
      await registerFonts();

      const width = 1200;
      const height = 630;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Фон
      ctx.fillStyle = '#0b0b0b';
      ctx.fillRect(0, 0, width, height);

      // Проверяем доступные шрифты
      console.log('Available fonts:', GlobalFonts.families);

      // Username
      ctx.fillStyle = '#00ff99';
      ctx.font = 'bold 48px "Arial"';
      ctx.textAlign = 'left';
      ctx.fillText(`@${username || 'user'}`, 80, 100);

      // Заголовок
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px "Arial"';
      ctx.fillText(title, 80, 200);

      // Описание
      ctx.font = '34px "Arial"';
      ctx.fillStyle = '#ffffff';
      const maxWidth = width - 160;
      const words = description.split(' ');
      let line = '';
      let y = 270;

      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line.trim(), 80, y);
          line = word + ' ';
          y += 45;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 80, y);

      // Очки
      ctx.fillStyle = '#00ff99';
      ctx.font = 'bold 40px "Arial"';
      ctx.fillText(`+${points || 0} очков`, 80, y + 70);

      // Цитаты
      const quotes = [
        '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
        '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
        '«Дисциплина сильнее мотивации ⚡️»',
        '«Начни сейчас. Идеального момента не будет ⏳»',
        '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      ctx.font = 'italic 30px "Arial"';
      ctx.fillStyle = '#9b9b9b';
      ctx.fillText(randomQuote, 80, height - 60);

      const buffer = canvas.toBuffer('image/png');
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        url: base64,
      });
    } catch (canvasError) {
      console.error('Canvas error:', canvasError);
      return generateSVGFallback(title, description, points, username);
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

// SVG fallback функция
function generateSVGFallback(title, description, points, username) {
  try {
    const quotes = [
      '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
      '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
      '«Дисциплина сильнее мотивации ⚡️»',
      '«Начни сейчас. Идеального момента не будет ⏳»',
      '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0b0b0b"/>
        <text x="80" y="100" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#00ff99">@${username || 'user'}</text>
        <text x="80" y="200" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#ffffff">${title.substring(0, 30)}</text>
        <text x="80" y="270" font-family="Arial, sans-serif" font-size="34" fill="#ffffff">${description.substring(0, 50)}</text>
        <text x="80" y="350" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#00ff99">+${points || 0} очков</text>
        <text x="80" y="570" font-family="Arial, sans-serif" font-size="30" font-style="italic" fill="#9b9b9b">${randomQuote}</text>
      </svg>
    `;

    const base64 = Buffer.from(svg).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
    });
  } catch (svgError) {
    console.error('SVG fallback error:', svgError);
    const encodedTitle = encodeURIComponent(title);
    const placeholderUrl = `https://via.placeholder.com/1200x630/0b0b0b/ffffff.png?text=${encodedTitle}`;

    return NextResponse.json({
      success: true,
      url: placeholderUrl,
    });
  }
}