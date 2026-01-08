// route.js для Next.js (Node runtime) - отдельный эндпоинт для получения изображений по ID
import { NextResponse } from 'next/server';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import path from 'path';
import { randomUUID } from 'crypto';

// In-memory store для простоты (в продакшене храните в S3/Redis и т.п.)
const IMAGES = new Map(); // id -> { buffer, createdAt }
const IMAGE_TTL_MS = 1000 * 60 * 60; // 1 час

const RARITY_COLORS = {
  common: {
    border: 'rgba(0, 255, 65, 0.6)',
    glow: 'rgba(72, 255, 0, 0.8)',
    text: 'rgba(72, 255, 0, 0.8)',
    ribbon: ' #00cc33',
    label: 'Обычная',
    points: '#00ff41',
  },
  rare: {
    border: '#00e5ff',
    glow: 'rgba(0,229,255,0.8)',
    text: '#00e5ff',
    ribbon: '#0099ff',
    label: 'Редкая',
    points: '#00ffff',
  },
  legendary: {
    border: 'rgba(255, 0, 255, 0.48)',
    glow: '#ff00ff',
    text: '#ffcc33',
    ribbon: '#ff00ff',
    label: 'Легендарная',
    points: 'rgba(255,204,51,0.9)',
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

/** Утилита: чистим старые изображения из памяти */
function cleanupExpired() {
  const now = Date.now();
  for (const [id, meta] of IMAGES.entries()) {
    if (now - meta.createdAt > IMAGE_TTL_MS) {
      IMAGES.delete(id);
    }
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Генерация PNG (вынесена в функцию) */
/** Генерация PNG */
async function generateImageBuffer({
  title,
  points = '0',
  username = 'user',
  img,
  rarityClass = 'common',
}) {
  const width = 720;
  const padding = 28;
  const radius = 100;
  let height = 1100; // Начальная оценка, потом ресайз

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const rarity = RARITY_COLORS[rarityClass] || RARITY_COLORS.common;

  const fontFamily = fontRegistered ? 'Inter' : 'Arial';
  const boldFontFamily = fontRegistered ? 'Inter-Bold' : 'Arial';

  // ===== ФОН =====
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  // ===== ВНУТРЕННИЙ БЛОК (без clip пока, чтобы не мешать ресайзу) =====
  const cardX = padding;
  const cardY = padding;
  const cardW = width - padding * 2;
  const cardH = height - padding * 2; // Временная, не используется для clip

  // Рисуем внутренний фон с закруглением (clip применим позже, если нужно)
  ctx.save();
  roundedRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.clip();
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.restore();

  let currentY = cardY; // Начинаем с верха для изображения

  // ===== ИЗОБРАЖЕНИЕ (на всю ширину блока, от верхней рамки) =====
  let imgBottomY = currentY;

  if (img) {
    const image = await loadImage(img);
    const imgW = cardW; // Полная ширина блока
    const ratio = image.height / image.width;
    const imgH = imgW * ratio;

    const imgX = cardX;
    const imgY = cardY;

    ctx.save();
    roundedRect(ctx, imgX, imgY, imgW, imgH, radius); // Тот же radius, чтобы сливалось с блоком
    ctx.clip();
    ctx.drawImage(image, imgX, imgY, imgW, imgH);
    ctx.restore();

    imgBottomY = imgY + imgH;
    currentY = imgBottomY + 60; // Отступ после изображения
  }

  // ===== ЛЕНТА РЕДКОСТИ — рисуем ПОСЛЕ изображения, чтобы была сверху =====
  ctx.save();
  // Позиционируем точку поворота в правый верхний угол (с небольшим отступом)
  ctx.translate(width - padding - 60, cardY + 80);
  ctx.rotate(Math.PI / 4); // поворот в другую сторону — из правого верхнего вниз влево

  // Длинная лента, выходящая за края
  ctx.fillStyle = rarity.ribbon;
  ctx.fillRect(-320, -28, 640, 56);

  // Текст на ленте
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 30px "${boldFontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rarity.label, 0, 0);
  ctx.restore();

  // ===== TITLE =====
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 52px "${boldFontFamily}"`;
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, currentY);
  currentY += 80;

  // ===== POINTS (ГРАДИЕНТНОЕ ЖЁЛТОЕ СВЕЧЕНИЕ) =====
  ctx.save();
  ctx.font = `700 66px "${boldFontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const pointsText = `${points} pts`;
  const textX = width / 2;
  const textY = currentY;

  const gradient = ctx.createLinearGradient(textX - 150, textY - 40, textX + 150, textY + 40);
  gradient.addColorStop(0, rarity.points);
  gradient.addColorStop(0.5, rarity.points);
  gradient.addColorStop(1, rarity.points);

  ctx.fillStyle = gradient;
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;

  ctx.shadowColor = rarity.points;
  ctx.shadowBlur = 20;
  ctx.strokeText(pointsText, textX, textY);
  ctx.fillText(pointsText, textX, textY);

  ctx.shadowBlur = 50;
  ctx.strokeText(pointsText, textX, textY);
  ctx.fillText(pointsText, textX, textY);
  ctx.restore();

  currentY += 100;

  // ===== АВТО ВЫСОТА =====
  const finalHeight = currentY + padding + 20;

  // Создаём финальный канвас нужной высоты
  const finalCanvas = createCanvas(width, finalHeight);
  const finalCtx = finalCanvas.getContext('2d');

  // Копируем контент из исходного канваса (верхнюю часть)
  finalCtx.drawImage(canvas, 0, 0, width, finalHeight, 0, 0, width, finalHeight);

  // ===== ВНЕШНЯЯ РАМКА (рисуем на финальном канвасе, чтобы была полная, включая снизу) =====
  finalCtx.save();
  finalCtx.strokeStyle = rarity.border;
  finalCtx.lineWidth = 10;
  finalCtx.shadowColor = rarity.glow;
  finalCtx.shadowBlur = 50;
  roundedRect(finalCtx, 0, 0, width, finalHeight, radius + 10);
  finalCtx.stroke();
  finalCtx.restore();

  return finalCanvas.toBuffer('image/png');
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