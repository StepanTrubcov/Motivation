import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'node:path';

const PALETTES = {
  common: { background: '#101b18', glow: '#305b45', accent: '#7be6aa', muted: '#bad0c3', ru: 'Обычная', en: 'Common' },
  rare: { background: '#111923', glow: '#284867', accent: '#78b9ff', muted: '#bacbdc', ru: 'Редкая', en: 'Rare' },
  legendary: { background: '#211c12', glow: '#68502a', accent: '#ffd166', muted: '#d7c9ae', ru: 'Легендарная', en: 'Legendary' },
  epic: { background: '#1c1425', glow: '#513469', accent: '#d09aff', muted: '#cfbddc', ru: 'Эпическая', en: 'Epic' },
};
let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  for (const [file, name] of [['Inter-Regular.woff2', 'StoryInter'], ['Inter-Bold.woff2', 'StoryBold']]) {
    GlobalFonts.registerFromPath(path.join(process.cwd(), 'public/fonts', file), name);
  }
  fontsReady = true;
}
function text(ctx, value, x, y, size, color, bold = false, align = 'left') {
  ctx.font = `${size}px ${bold ? 'StoryBold' : 'StoryInter'}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(value, x, y);
}
export function wrapStoryText(ctx, value, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of String(value || '').trim().split(/\s+/)) {
    if (ctx.measureText(word).width > maxWidth) {
      if (line) { lines.push(line); line = ''; }
      for (const char of word) {
        if (line && ctx.measureText(line + char).width > maxWidth) { lines.push(line); line = ''; }
        line += char;
      }
    } else if (line && ctx.measureText(`${line} ${word}`).width > maxWidth) {
      lines.push(line); line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}
function fitText(ctx, value, maxWidth, initialSize, maxLines, bold = false) {
  let size = initialSize, lines;
  do {
    ctx.font = `${size}px ${bold ? 'StoryBold' : 'StoryInter'}`;
    lines = wrapStoryText(ctx, value, maxWidth);
    if (lines.length <= maxLines) break;
    size -= 2;
  } while (size >= 22);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = last + '…';
  }
  return { size, lines };
}
export function renderAchievementStory({ title = 'Достижение', description = '', image, rarityClass = 'common', language = 'ru', earnedAt }) {
  registerFonts();
  const en = language === 'en';
  const palette = PALETTES[rarityClass] || PALETTES.common;
  const canvas = createCanvas(1080, 1920), ctx = canvas.getContext('2d');
  ctx.fillStyle = palette.background; ctx.fillRect(0, 0, 1080, 1920);
  const glow = ctx.createRadialGradient(540, 900, 20, 540, 900, 720);
  glow.addColorStop(0, palette.glow); glow.addColorStop(1, palette.background);
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 1080, 1920);
  text(ctx, en ? 'My new' : 'Моя новая', 86, 172, 82, '#f1f7f2', true);
  text(ctx, en ? 'achievement' : 'ачивка', 86, 272, 82, '#f1f7f2', true);
  if (image) {
    const scale = Math.min(832 / image.width, 832 / image.height);
    const width = image.width * scale, height = image.height * scale;
    ctx.drawImage(image, 124 + (832 - width) / 2, 465 + (832 - height) / 2, width, height);
  }
  const heading = fitText(ctx, title, 904, 88, 2, true);
  const headingHeight = heading.lines.length * heading.size * 1.2;
  const headingTop = 1325 + (212 - headingHeight) / 2;
  heading.lines.forEach((line, i) => text(ctx, line, 540, headingTop + i * heading.size * 1.2, heading.size, '#fff', true, 'center'));
  const caption = fitText(ctx, description, 880, 34, 2);
  caption.lines.forEach((line, i) => text(ctx, line, 540, 1545 + i * caption.size * 1.35, caption.size, palette.muted, false, 'center'));
  ctx.fillStyle = '#ffffff24'; ctx.fillRect(88, 1665, 904, 2);
  let dateLabel = '';
  if (earnedAt) {
    const date = new Date(earnedAt);
    if (!Number.isNaN(date.getTime())) dateLabel = date.toLocaleDateString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric', timeZone:'UTC'});
  }
  text(ctx, [en ? palette.en : palette.ru, dateLabel].filter(Boolean).join(' · '), 88, 1701, 30, palette.muted);
  text(ctx, '@BotMotivation_TG_bot', 88, 1761, 30, palette.accent, true);
  return canvas.toBuffer('image/png');
}
