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

      // Ваш существующий код отрисовки...
      ctx.fillStyle = '#0b0b0b';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff99';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`@${username || 'user'}`, 80, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Arial';
      ctx.fillText(title, 80, 200);

      ctx.font = '34px Arial';
      ctx.fillStyle = '#ffffff';
      const maxWidth = width - 160;
      const words = description.split(' ');
      let line = '';
      let y = 270;
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          ctx.fillText(line.trim(), 80, y);
          line = word + ' ';
          y += 45;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 80, y);

      // === Очки ===
      ctx.fillStyle = '#00ff99';
      ctx.font = 'bold 40px Arial';
      ctx.fillText(`+${points || 0} очков`, 80, y + 70);

      // === Цитаты ===
      const quotes = [
        '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
        '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
        '«Дисциплина сильнее мотивации ⚡️»',
        '«Начни сейчас. Идеального момента не будет ⏳»',
        '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      ctx.font = 'italic 30px Arial';
      ctx.fillStyle = '#9b9b9b';
      ctx.fillText(randomQuote, 80, height - 60);

      // Генерация Base64
      const buffer = canvas.toBuffer('image/png');
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        url: base64,
      });
    } catch (canvasError) {
      console.error('Canvas error:', canvasError);
      const encodedTitle = encodeURIComponent(title);
      const placeholderUrl = `https://via.placeholder.com/1200x630/0b0b0b/ffffff.png?text=${encodedTitle}`;

      return NextResponse.json({
        success: true,
        url: placeholderUrl,
      });
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