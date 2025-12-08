import { NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';

// Явно указываем, что хотим использовать Node.js runtime
export const runtime = 'nodejs';

// Регистрируем шрифты Inter
let fontRegistered = false;
try {
  const regularFontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.woff2');
  const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Bold.woff2');
  const italicFontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Italic.woff2');
  
  GlobalFonts.registerFromPath(regularFontPath, 'Inter');
  GlobalFonts.registerFromPath(boldFontPath, 'Inter-Bold');
  GlobalFonts.registerFromPath(italicFontPath, 'Inter-Italic');
  
  fontRegistered = true;
  console.log('Шрифты Inter успешно зарегистрированы');
} catch (error) {
  console.error('Ошибка при регистрации шрифтов Inter:', error);
}

/**
 * Безопасное декодирование строки, которая может быть:
 * - уже раскодирована,
 * - закодирована один раз,
 * - закодирована дважды (или более, но мы ограничиваем итерации).
 * Также заменяет + на пробел (форма-urlencoded).
 */
function safeDecodeMaybeDoubleEncoded(input) {
  if (!input || typeof input !== 'string') return input;
  // заменяем + на пробел
  let s = input.replace(/\+/g, ' ');
  // пытаемся декодировать, пока видим %-последовательности (до 3 итераций)
  for (let i = 0; i < 3; i++) {
    if (/%[0-9A-F]{2}/i.test(s)) {
      try {
        const dec = decodeURIComponent(s);
        if (dec === s) break; // если ничего не изменилось — выходим
        s = dec;
      } catch (e) {
        // decodeURIComponent может кидать на некорректных последовательностях
        // в этом случае прекращаем попытки
        break;
      }
    } else {
      break;
    }
  }
  return s;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- Логирование для отладки: увидим, в каком виде приходят параметры ---
    console.log('REQUEST URL:', request.url);
    console.log('raw title param:', searchParams.get('title'));
    console.log('raw description param:', searchParams.get('description'));
    console.log('raw username param:', searchParams.get('username'));
    console.log('raw points param:', searchParams.get('points'));
    // -----------------------------------------------------------------------

    // Получаем параметры (не декодируем напрямую)
    let titleRaw = searchParams.get('title') || 'Достижение';
    let descriptionRaw = searchParams.get('description') || 'Описание достижения';
    let pointsRaw = searchParams.get('points') || '0';
    let usernameRaw = searchParams.get('username') || 'user';

    // Прогоняем через безопасное декодирование
    const title = safeDecodeMaybeDoubleEncoded(titleRaw);
    const description = safeDecodeMaybeDoubleEncoded(descriptionRaw);
    const username = safeDecodeMaybeDoubleEncoded(usernameRaw);
    const points = safeDecodeMaybeDoubleEncoded(pointsRaw);

    // Дополнительный лог уже после декодирования
    console.log('decoded title:', title);
    console.log('decoded description:', description);
    console.log('decoded username:', username);
    console.log('decoded points:', points);

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, width, height);

    // Используем зарегистрированные шрифты или fallback
    const fontFamily = fontRegistered ? 'Inter' : 'Arial';
    const boldFontFamily = fontRegistered ? 'Inter-Bold' : 'Arial';
    const italicFontFamily = fontRegistered ? 'Inter-Italic' : 'Arial';

    // Имя пользователя (зелёным)
    ctx.fillStyle = '#00ff99';
    ctx.font = `700 48px "${fontFamily}"`;
    ctx.textAlign = 'left';
    ctx.fillText(`@${username}`, 80, 100);

    // Название достижения
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 80px "${boldFontFamily}"`;

    // Ограничиваем длину заголовка (в символах) и отображаем
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    ctx.fillText(shortTitle, 80, 200);

    // Описание достижения
    ctx.font = `34px "${fontFamily}"`;
    ctx.fillStyle = '#ffffff';
    const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;

    // Перенос строк по количеству символов — более надёжно рассчитывать ширину текста через measureText,
    // но для простоты используем символный лимит (при необходимости позже улучшим).
    const lines = [];
    let currentLine = '';
    const words = shortDesc.split(' ');

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      // сравниваем длину символов строки (упрощённо)
      if (testLine.length > 40) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Рисуем линии описания (макс 3 строки)
    let y = 270;
    for (const line of lines.slice(0, 3)) {
      ctx.fillText(line.trim(), 80, y);
      y += 45;
    }

    // Очки
    ctx.fillStyle = '#00ff99';
    ctx.font = `700 40px "${boldFontFamily}"`;
    ctx.fillText(`+${points} очков`, 80, y + 30);

    // Цитата (случайная)
    const quotes = [
      '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
      '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
      '«Дисциплина сильнее мотивации ⚡️»',
      '«Начни сейчас. Идеального момента не будет ⏳»',
      '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    ctx.font = `italic 30px "${italicFontFamily}"`;
    ctx.fillStyle = '#9b9b9b';
    const shortQuote = randomQuote.length > 60 ? randomQuote.substring(0, 60) + '...' : randomQuote;
    ctx.fillText(shortQuote, 80, height - 60);

    // Возвращаем PNG
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