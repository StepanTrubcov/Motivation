import { NextResponse } from 'next/server';
import { join } from 'path';

let canvasModule;
try {
  canvasModule = require('canvas');
  console.log('✅ Canvas module loaded successfully');
} catch (error) {
  console.warn('⚠️ Canvas module not available:', error.message);
  canvasModule = null;
}

// Если canvas доступен, регистрируем шрифты
if (canvasModule) {
  try {
    const { registerFont } = canvasModule;
    const fontsDir = join(process.cwd(), 'public', 'fonts');
    registerFont(join(fontsDir, 'Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });
    registerFont(join(fontsDir, 'Inter-Regular.ttf'), { family: 'Inter', weight: 'normal' });
    console.log('✅ Fonts registered successfully');
  } catch (error) {
    console.error('❌ Error registering fonts:', error);
  }
}

export async function POST(request) {
  try {
    const { title, description, image, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Если canvas не доступен, возвращаем ошибку
    if (!canvasModule) {
      return NextResponse.json({ 
        success: false, 
        message: 'Сервис генерации изображений временно недоступен' 
      }, { status: 503 });
    }

    const { createCanvas } = canvasModule;
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, width, height);

    // Имя пользователя
    ctx.fillStyle = '#00ff99';
    ctx.font = 'bold 48px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`@${username || 'user'}`, 80, 100);

    // Заголовок
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Inter';
    ctx.fillText(title, 80, 200);

    // Описание
    ctx.font = '34px Inter';
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
    ctx.font = 'bold 40px Inter';
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

    ctx.font = 'italic 30px Inter';
    ctx.fillStyle = '#9b9b9b';
    ctx.fillText(randomQuote, 80, height - 60);

    // Генерируем изображение
    const buffer = canvas.toBuffer('image/png');
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: base64,
    });
  } catch (error) {
    console.error('❌ Ошибка генерации share-картинки:', error);
    return NextResponse.json({ success: false, message: 'Ошибка генерации изображения' }, { status: 500 });
  }
}