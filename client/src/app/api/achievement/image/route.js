// app/api/og/route.js
import { NextResponse } from 'next/server';
import { createCanvas, registerFont } from '@napi-rs/canvas';
import path from 'path';

export const runtime = 'nodejs';

// Регистрируем TTF-шрифты (положи Inter-Regular.ttf в public/fonts)
try {
  const regular = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf');
  const bold = path.join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf');
  const italic = path.join(process.cwd(), 'public', 'fonts', 'Inter-Italic.ttf');

  // registerFont(path, { family: 'Name', weight: '400', style: 'normal' })
  registerFont(regular, { family: 'Inter', weight: '400' });
  // если файлов нет, registerFont выбросит ошибку — мы ловим её
  if (typeof bold === 'string') {
    try { registerFont(bold, { family: 'Inter', weight: '700' }); } catch(e) {}
  }
  if (typeof italic === 'string') {
    try { registerFont(italic, { family: 'Inter', style: 'italic' }); } catch(e) {}
  }
  console.log('Inter fonts registered');
} catch (e) {
  console.warn('Fonts registration failed (make sure .ttf files are in public/fonts):', e);
}

// безопасное декодирование параметра, чтобы не декодировать дважды и не ломать строку
function tryDecode(s) {
  if (!s) return s;
  if (s.includes('%')) {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }
  return s;
}

// функция для переноса текста по ширине с измерением
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && line !== '') {
      ctx.fillText(line, x, y);
      line = words[n];
      y += lineHeight;
      lineCount++;
      if (lineCount >= maxLines) return y;
    } else {
      line = testLine;
    }
  }
  if (line) {
    if (lineCount < maxLines) ctx.fillText(line, x, y);
  }
  return y + lineHeight;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const titleParam = tryDecode(searchParams.get('title')) || 'Достижение';
    const descriptionParam = tryDecode(searchParams.get('description')) || 'Описание достижения';
    const pointsParam = tryDecode(searchParams.get('points')) || '0';
    const usernameParam = tryDecode(searchParams.get('username')) || 'user';

    // простая защита: если клиент передаёт уже закодированную строку типа "%D0%9A..."
    // tryDecode её раскодирует, иначе оставит как есть

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // фон
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, width, height);

    // белый контейнер (как у тебя в примере)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 40, width - 80, height - 80);

    // зеленая шапка
    ctx.fillStyle = '#00AA00';
    ctx.fillRect(60, 60, width - 120, 100);

    // username
    ctx.fillStyle = '#00ff99';
    ctx.textAlign = 'left';
    ctx.font = '700 32px Inter'; // bold 32px Inter
    ctx.fillText(`@${usernameParam}`, 80, 110);

    // title (большой)
    ctx.fillStyle = '#000000';
    ctx.font = '700 64px Inter';
    const safeTitle = titleParam.length > 60 ? titleParam.substring(0, 57) + '...' : titleParam;
    // ограничиваем ширину для заголовка
    const titleMaxWidth = width - 160;
    wrapText(ctx, safeTitle, 80, 190, titleMaxWidth, 72, 1);

    // description (несколько строк, измерение по пикселям)
    ctx.fillStyle = '#000000';
    ctx.font = '400 28px Inter';
    const shortDesc = descriptionParam.length > 300 ? descriptionParam.substring(0, 297) + '...' : descriptionParam;
    const descMaxWidth = width - 160;
    // начинаем рисовать ниже заголовка
    let nextY = wrapText(ctx, shortDesc, 80, 240, descMaxWidth, 36, 3);

    // points
    ctx.fillStyle = '#00ff99';
    ctx.font = '700 36px Inter';
    ctx.fillText(`+${pointsParam} очков`, 80, nextY + 10);

    // цитата внизу
    const quotes = [
      '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
      '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
      '«Дисциплина сильнее мотивации ⚡️»',
      '«Начни сейчас. Идеального момента не будет ⏳»',
      '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    ctx.fillStyle = '#9b9b9b';
    ctx.font = 'italic 24px Inter';
    const quoteMax = randomQuote.length > 120 ? randomQuote.substring(0, 117) + '...' : randomQuote;
    ctx.fillText(quoteMax, 80, height - 60);

    // вернуть PNG
    const buffer = canvas.toBuffer('image/png');
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('❌ Ошибка генерации изображения:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
