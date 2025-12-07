import { NextResponse } from 'next/server';
import { createCanvas, registerFont } from '@napi-rs/canvas';
import path from 'path';

// Явно указываем, что хотим использовать Node.js runtime
export const runtime = 'nodejs';

// Регистрируем шрифты Inter (важно: .ttf/.otf, не .woff2)
let fontRegistered = false;
try {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const regularFontPath = path.join(fontsDir, 'Inter-Regular.ttf');
  const boldFontPath = path.join(fontsDir, 'Inter-Bold.ttf');
  const italicFontPath = path.join(fontsDir, 'Inter-Italic.ttf');

  // registerFont(path, { family: 'Inter', weight?: '400' })
  registerFont(regularFontPath, { family: 'Inter', weight: '400' });
  try { registerFont(boldFontPath, { family: 'Inter', weight: '700' }); } catch (e) {}
  try { registerFont(italicFontPath, { family: 'Inter', style: 'italic' }); } catch (e) {}

  fontRegistered = true;
  console.log('Шрифты Inter успешно зарегистрированы');
} catch (error) {
  console.error('Ошибка при регистрации шрифтов Inter:', error);
}

// безопасное декодирование параметра (чтобы не декодировать дважды)
function tryDecode(s) {
  if (!s) return s;
  if (s.includes('%')) {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }
  return s;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Используем tryDecode — безопасно для уже декодированных и закодированных строк
    const title = tryDecode(searchParams.get('title')) || 'Достижение';
    const description = tryDecode(searchParams.get('description')) || 'Описание достижения';
    const points = tryDecode(searchParams.get('points')) || '0';
    const username = tryDecode(searchParams.get('username')) || 'user';

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, width, height);

    // Используем зарегистрированные шрифты Inter или fallback
    const fontFamily = fontRegistered ? 'Inter' : 'Arial, sans-serif';
    // Для bold/italic используем ту же family (Inter), вес/стиль задаём в font строке
    ctx.fillStyle = '#00ff99';
    ctx.font = `700 48px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(`@${username}`, 80, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 80px ${fontFamily}`;

    // Ограничиваем длину заголовка
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    ctx.fillText(shortTitle, 80, 200);

    // Описание с ограничением
    ctx.font = `400 34px ${fontFamily}`;
    ctx.fillStyle = '#ffffff';
    const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;

    // Простой перенос строк по словам (без измерений, минимальное вмешательство)
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
    ctx.font = `700 40px ${fontFamily}`;
    ctx.fillText(`+${points} очков`, 80, y + 30);

    // Цитата
    const quotes = [
      '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
      '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
      '«Дисциплина сильнее мотивации ⚡️»',
      '«Начни сейчас. Идеального момента не будет ⏳»',
      '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    ctx.font = `italic 30px ${fontFamily}`;
    ctx.fillStyle = '#9b9b9b';

    // Обрезаем длинную цитату
    const shortQuote = randomQuote.length > 60 ? randomQuote.substring(0, 60) + '...' : randomQuote;
    ctx.fillText(shortQuote, 80, height - 60);

    // Возвращаем изображение как PNG
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
