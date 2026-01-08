// route.js для Next.js (Node runtime)
import { NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { randomUUID } from 'crypto';

// In-memory store для простоты (в продакшене храните в S3/Redis и т.п.)
export const IMAGES = new Map(); // id -> { buffer, createdAt }
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
export function cleanupExpired() {
  const now = Date.now();
  for (const [id, meta] of IMAGES.entries()) {
    if (now - meta.createdAt > IMAGE_TTL_MS) {
      IMAGES.delete(id);
    }
  }
}

/** Генерация PNG (вынесена в функцию) */
async function generateImageBuffer({
  title,
  points = '0',
  username = 'user',
  img,
  rarityClass = 'common',
}) {
  const width = 630;
  const height = 1200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const rarity = RARITY_COLORS[rarityClass] || RARITY_COLORS.common;

  // ===== ФОН =====
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, width, height);

  // ===== СВЕЧЕНИЕ =====
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 40;

  // ===== ОСНОВНАЯ КАРТИНКА =====
  if (img) {
    const image = await loadImage(img);
    ctx.drawImage(image, 40, 140, width - 80, 700);
  }

  ctx.shadowBlur = 0;

  const fontFamily = fontRegistered ? 'Inter' : 'Arial';
  const boldFontFamily = fontRegistered ? 'Inter-Bold' : 'Arial';

  // ===== USERNAME =====
  ctx.fillStyle = rarity.text;
  ctx.font = `700 42px "${fontFamily}"`;
  ctx.fillText(`@${username}`, 60, 70);

  // ===== TITLE =====
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 56px "${boldFontFamily}"`;
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 900);

  // ===== POINTS =====
  ctx.fillStyle = rarity.text;
  ctx.font = `700 64px "${boldFontFamily}"`;
  ctx.fillText(`${points} pts`, width / 2, 980);

  return canvas.toBuffer('image/png');
}

export async function POST(request) {
  try {
    const body = await request.json();

    const buffer = await generateImageBuffer({
      title: body.title || 'Достижение',
      points: body.points || '0',
      username: body.username || 'user',
      img: body.img,
      rarityClass: body.rarityClass || 'common',
    });

    const id = randomUUID();
    IMAGES.set(id, { buffer, createdAt: Date.now() });

    cleanupExpired();

    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'example.com';
    const url = `${protocol}://${host}/api/og-image?id=${id}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error('POST error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request) {
  try {
    const urlObj = new URL(request.url);
    const id = urlObj.searchParams.get('id');

    if (!id) {
      // Старый поведение: поддержка прямого GET с title/description (backward compat).
      // Если клиент всё ещё вызывает GET?title=... — генерируем картинку на лету (как раньше),
      // но это не рекомендуется для шаринга (может привести к закодированным строкам в url).
      const searchParams = urlObj.searchParams;
      // безопасное декодирование - на случай двойной кодировки
      function safeDecodeMaybeDoubleEncoded(input) {
        if (!input || typeof input !== 'string') return input;
        let s = input.replace(/\+/g, ' ');
        for (let i = 0; i < 3; i++) {
          if (/%[0-9A-F]{2}/i.test(s)) {
            try {
              const dec = decodeURIComponent(s);
              if (dec === s) break;
              s = dec;
            } catch (e) { break; }
          } else break;
        }
        return s;
      }

      const titleRaw = searchParams.get('title') || 'Достижение';
      const descRaw = searchParams.get('description') || 'Описание достижения';
      const usernameRaw = searchParams.get('username') || 'user';
      const pointsRaw = searchParams.get('points') || '0';

      const title = safeDecodeMaybeDoubleEncoded(titleRaw);
      const description = safeDecodeMaybeDoubleEncoded(descRaw);
      const username = safeDecodeMaybeDoubleEncoded(usernameRaw);
      const points = safeDecodeMaybeDoubleEncoded(pointsRaw);

      const buffer = generateImageBuffer({ title, description, username, points });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
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