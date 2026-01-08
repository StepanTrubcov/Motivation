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

async function generateImageBuffer({
  title,
  points = '0',
  username = 'user',
  img,
  rarityClass = 'common',
}) {
  const baseWidth = 720;
  const cardScale = 0.3; // Уменьшаем саму карточку (с изображением, текстом, цветной рамкой)
  const cardWidth = Math.round(baseWidth * cardScale);

  const padding = Math.round(28 * cardScale);
  const radius = Math.round(100 * cardScale);

  let height = Math.round(1100 * cardScale);

  // Для улучшения качества рендерим в 4x разрешении (увеличил dpiScale для большей чёткости)
  const dpiScale = 5;
  const renderWidth = cardWidth * dpiScale;
  const renderHeight = height * dpiScale;

  // Создаём канвас для карточки в высоком разрешении
  const cardCanvas = createCanvas(renderWidth, renderHeight);
  const cardCtx = cardCanvas.getContext('2d');
  cardCtx.scale(dpiScale, dpiScale); // Масштабируем контекст для координат

  const rarity = RARITY_COLORS[rarityClass] || RARITY_COLORS.common;

  const boldFontFamily = fontRegistered ? 'Inter-Bold' : 'Arial';

  // ===== КАРТОЧКА: Внутренний фон (чёрный для области вокруг текста) =====
  const cardX = padding;
  const cardY = padding;
  const cardW = cardWidth - padding * 2;

  cardCtx.save();
  roundedRect(cardCtx, cardX, cardY, cardW, height - padding * 2, radius);
  cardCtx.clip();
  cardCtx.fillStyle = '#000000'; // Чёрный фон внутри карточки
  cardCtx.fillRect(cardX, cardY, cardW, height - padding * 2);
  cardCtx.restore();

  let currentY = cardY;

  // ===== КАРТОЧКА: ИЗОБРАЖЕНИЕ =====
  if (img) {
    const image = await loadImage(img);
    const imgW = cardW;
    const ratio = image.height / image.width;
    const imgH = imgW * ratio;

    const imgX = cardX;
    const imgY = cardY;

    cardCtx.save();
    roundedRect(cardCtx, imgX, imgY, imgW, imgH, radius);
    cardCtx.clip();
    cardCtx.drawImage(image, imgX, imgY, imgW, imgH);
    cardCtx.restore();

    currentY = imgY + imgH + Math.round(60 * cardScale);
  }

  // ===== КАРТОЧКА: ЛЕНТА РЕДКОСТИ =====
  cardCtx.save();
  cardCtx.translate(cardWidth - padding - Math.round(60 * cardScale), cardY + Math.round(80 * cardScale));
  cardCtx.rotate(Math.PI / 4);

  cardCtx.fillStyle = rarity.ribbon;
  cardCtx.fillRect(-Math.round(320 * cardScale), -Math.round(28 * cardScale), Math.round(640 * cardScale), Math.round(56 * cardScale));

  cardCtx.fillStyle = '#ffffff';
  cardCtx.font = `700 ${Math.round(30 * cardScale)}px "${boldFontFamily}"`;
  cardCtx.textAlign = 'center';
  cardCtx.textBaseline = 'middle';
  cardCtx.fillText(rarity.label, 0, 0);
  cardCtx.restore();

  // ===== КАРТОЧКА: TITLE =====
  cardCtx.fillStyle = '#ffffff';
  cardCtx.font = `700 ${Math.round(52 * cardScale)}px "${boldFontFamily}"`;
  cardCtx.textAlign = 'center';
  cardCtx.fillText(title, cardWidth / 2, currentY);
  currentY += Math.round(80 * cardScale);

  // ===== КАРТОЧКА: POINTS =====
  cardCtx.save();
  cardCtx.font = `500 ${Math.round(66 * cardScale)}px "${boldFontFamily}"`;
  cardCtx.textAlign = 'center';
  cardCtx.textBaseline = 'middle';

  const pointsText = `${points} pts`;
  const textX = cardWidth / 2;
  const textY = currentY;

  const gradient = cardCtx.createLinearGradient(textX - Math.round(150 * cardScale), textY - Math.round(40 * cardScale), textX + Math.round(150 * cardScale), textY + Math.round(40 * cardScale));
  gradient.addColorStop(0, rarity.points);
  gradient.addColorStop(0.5, rarity.points);
  gradient.addColorStop(1, rarity.points);

  cardCtx.fillStyle = gradient;
  cardCtx.strokeStyle = gradient;
  cardCtx.lineWidth = Math.round(4 * cardScale);

  cardCtx.shadowColor = rarity.points;
  cardCtx.shadowBlur = Math.round(20 * cardScale);
  cardCtx.strokeText(pointsText, textX, textY);
  cardCtx.fillText(pointsText, textX, textY);

  cardCtx.shadowBlur = Math.round(50 * cardScale);
  cardCtx.strokeText(pointsText, textX, textY);
  cardCtx.fillText(pointsText, textX, textY);
  cardCtx.restore();

  currentY += Math.round(100 * cardScale);

  const cardFinalHeight = currentY + padding + Math.round(20 * cardScale);

  // Ресайз карточки по высоте в высоком разрешении
  const resizedRenderHeight = cardFinalHeight * dpiScale;
  const resizedCard = createCanvas(renderWidth, resizedRenderHeight);
  const resizedCtx = resizedCard.getContext('2d');
  resizedCtx.drawImage(cardCanvas, 0, 0);

  // Даунсемплинг для финальной карточки (улучшает анти-алиасинг)
  const downsampledCard = createCanvas(cardWidth * dpiScale / 2, cardFinalHeight * dpiScale / 2); // Сохраняем повышенную плотность пикселей для чёткости
  const downCtx = downsampledCard.getContext('2d');
  downCtx.imageSmoothingQuality = 'high';
  downCtx.drawImage(resizedCard, 0, 0, cardWidth * dpiScale / 2, cardFinalHeight * dpiScale / 2);

  // ===== ЦВЕТНАЯ РАМКА СО СВЕЧЕНИЕМ вокруг карточки =====
  const glowCanvas = createCanvas(downsampledCard.width, downsampledCard.height);
  const glowCtx = glowCanvas.getContext('2d');
  glowCtx.drawImage(downsampledCard, 0, 0);

  glowCtx.save();
  glowCtx.scale(2, 2); // Масштабируем для свечения в повышенном разрешении
  glowCtx.strokeStyle = rarity.border;
  glowCtx.lineWidth = Math.round(10 * cardScale) / 2;
  glowCtx.shadowColor = rarity.glow;
  glowCtx.shadowBlur = Math.round(50 * cardScale) / 2;
  roundedRect(glowCtx, 0, 0, cardWidth, cardFinalHeight, radius + Math.round(10 * cardScale));
  glowCtx.stroke();
  glowCtx.restore();

  // ===== ФИНАЛЬНЫЙ КАНВАС: большая чёрная рамка =====
  const blackBorderWidth = 80; // Очень широкая чёрная рамка (можно изменить)
  const finalWidth = cardWidth + 2 * blackBorderWidth;
  const finalHeight = cardFinalHeight + 2 * blackBorderWidth;

  // Рендерим финальный канвас тоже в повышенном разрешении
  const finalRenderWidth = finalWidth * dpiScale / 2;
  const finalRenderHeight = finalHeight * dpiScale / 2;

  const finalCanvas = createCanvas(finalRenderWidth, finalRenderHeight);
  const finalCtx = finalCanvas.getContext('2d');

  // Чёрный фон полностью
  finalCtx.fillStyle = '#000000';
  finalCtx.fillRect(0, 0, finalRenderWidth, finalRenderHeight);

  // Большая чёрная рамка с закруглениями (без свечения)
  finalCtx.save();
  finalCtx.scale(dpiScale / 2, dpiScale / 2);
  finalCtx.fillStyle = '#000000';
  roundedRect(finalCtx, 0, 0, finalWidth, finalHeight, radius + blackBorderWidth + Math.round(20 * cardScale));
  finalCtx.fill();
  finalCtx.restore();

  // Вставляем карточку с цветной рамкой по центру
  finalCtx.drawImage(glowCanvas, blackBorderWidth * dpiScale / 2, blackBorderWidth * dpiScale / 2);

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