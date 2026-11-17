import { temporaryImages as IMAGES } from '@/lib/serverImageStore';
import { loadAchievementImage } from '@/lib/loadAchievementImage';
// route.js для Next.js (Node runtime)
import { NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { randomUUID } from 'crypto';

const RARITY_COLORS = {
  common: {
    border: 'rgba(0, 255, 65, 0.6)',
    glow: 'rgba(72, 255, 0, 0.8)',
    text: 'rgba(72, 255, 0, 0.8)',
    ribbon: ' #00cc33',
    label: 'Обычная',
  },
  rare: {
    border: '#00e5ff',
    glow: 'rgba(0,229,255,0.8)',
    text: '#00e5ff',
    ribbon: '#0099ff',
    label: 'Редкая',
  },
  legendary: {
    border: 'rgba(255, 0, 255, 0.48)',
    glow: '#ff00ff',
    text: '#ffcc33',
    ribbon: '#ff00ff',
    label: 'Легендарная',
  },
  epic: {
    border: '#ff9a4d',
    glow: '#ff9a4d',
    text: '#ffcc33',
    ribbon: '#ff8f44',
    label: 'Эпическая',
  },
};

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

/** Генерация PNG (вынесена в функцию) */
async function generateImageBuffer({
  title,
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
    const image = await loadAchievementImage(img);
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

  return canvas.toBuffer('image/png');
}

export async function POST(request) {
  try {
    const body = await request.json();

    const buffer = await generateImageBuffer({
      title: body.title || 'Достижение',
      username: body.username || 'user',
      img: body.img,
      rarityClass: body.rarityClass || 'common',
    });

    if (request.signal.aborted) return new NextResponse(null, { status: 499 });
    const id = randomUUID();
    IMAGES.set(id, { buffer, createdAt: Date.now() });


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

      const title = safeDecodeMaybeDoubleEncoded(titleRaw);
      const description = safeDecodeMaybeDoubleEncoded(descRaw);
      const username = safeDecodeMaybeDoubleEncoded(usernameRaw);

      const buffer = await generateImageBuffer({ title, description, username });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'private, no-store',
        },
      });
    }

    // отдаём сохранённую картинку по id
    const meta = IMAGES.get(id);
    if (!meta) return new NextResponse('Not Found', { status: 404 });

    return new NextResponse(meta.buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('GET error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
