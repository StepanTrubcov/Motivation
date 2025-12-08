// route.js для Next.js (Node runtime) - отдельный эндпоинт для получения изображений по ID
import { NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { randomUUID } from 'crypto';

// In-memory store для простоты (в продакшене храните в S3/Redis и т.п.)
const IMAGES = new Map(); // id -> { buffer, createdAt }
const IMAGE_TTL_MS = 1000 * 60 * 60; // 1 час

export const runtime = 'nodejs';

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

/** Утилита: чистим старые изображения из памяти */
function cleanupExpired() {
  const now = Date.now();
  for (const [id, meta] of IMAGES.entries()) {
    if (now - meta.createdAt > IMAGE_TTL_MS) {
      IMAGES.delete(id);
    }
  }
}

/** Генерация PNG (вынесена в функцию) */
function generateImageBuffer({ title, description, points = '0', username = 'user' }) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Фон
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, width, height);

  const fontFamily = fontRegistered ? 'Inter' : 'Arial';
  const boldFontFamily = fontRegistered ? 'Inter-Bold' : 'Arial';
  const italicFontFamily = fontRegistered ? 'Inter-Italic' : 'Arial';

  // username
  ctx.fillStyle = '#00ff99';
  ctx.font = `700 48px "${fontFamily}"`;
  ctx.textAlign = 'left';
  ctx.fillText(`@${username}`, 80, 100);

  // title
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 80px "${boldFontFamily}"`;
  const shortTitle = (title || 'Достижение').length > 30 ? title.substring(0, 30) + '...' : (title || 'Достижение');
  ctx.fillText(shortTitle, 80, 200);

  // description (wrap)
  ctx.font = `34px "${fontFamily}"`;
  ctx.fillStyle = '#ffffff';
  const shortDesc = (description || 'Описание достижения').length > 100 ? description.substring(0, 100) + '...' : (description || 'Описание достижения');

  // Простой перенос слов по символам (можно улучшить с measureText)
  const lines = [];
  let currentLine = '';
  const words = shortDesc.split(' ');
  for (const word of words) {
    const testLine = currentLine ? (currentLine + ' ' + word) : word;
    if (testLine.length > 40) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  let y = 270;
  for (const line of lines.slice(0, 3)) {
    ctx.fillText(line.trim(), 80, y);
    y += 45;
  }

  // points
  ctx.fillStyle = '#00ff99';
  ctx.font = `700 40px "${boldFontFamily}"`;
  ctx.fillText(`+${points} очков`, 80, y + 30);

  // quote
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

  return canvas.toBuffer('image/png');
}

// POST — принять JSON { title, description, username, points }
// вернёт: { url: '/api/og-image?id=<id>' }
export async function POST(request) {
  try {
    const body = await request.json();
    // Ожидаем, что client прислал уже декодированные строки (не percent-encoded)
    const title = body.title || 'Достижение';
    const description = body.description || 'Описание достижения';
    const username = body.username || 'user';
    const points = body.points || '0';

    const buffer = generateImageBuffer({ title, description, username, points });

    // Сохраняем в памяти (в проде — в S3/redis)
    const id = randomUUID();
    IMAGES.set(id, { buffer, createdAt: Date.now() });

    // Убираем старые элементы асинхронно
    cleanupExpired();

    // Возвращаем чистый URL (без title/description)
    const protocol = (request.headers.get('x-forwarded-proto') || 'https');
    const host = request.headers.get('host') || 'example.com';
    const url = `${protocol}://${host}/api/og-image?id=${id}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error('POST error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET с ?id=... — отдаёт изображение по id
export async function GET(request) {
  try {
    const urlObj = new URL(request.url);
    const id = urlObj.searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing id parameter', { status: 400 });
    }

    // отдаём сохранённую картинку по id
    const meta = IMAGES.get(id);
    if (!meta) return new NextResponse('Not Found', { status: 404 });

    return new NextResponse(meta.buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // можно настроить
      },
    });
  } catch (err) {
    console.error('GET error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}