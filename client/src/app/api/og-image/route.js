import { temporaryImages as IMAGES } from '@/lib/serverImageStore';
import { loadAchievementImage } from '@/lib/loadAchievementImage';
import { renderAchievementStory } from '@/lib/achievementStory.mjs';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
async function generateImageBuffer({ img, ...data }) {
  const image = img ? await loadAchievementImage(img) : null;
  return renderAchievementStory({ ...data, image });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const buffer = await generateImageBuffer({
      title: body.title || 'Достижение',
      username: body.username || 'user',
      img: body.img,
      rarityClass: body.rarityClass || 'common',
      language: body.language || 'ru',
      description: body.description || '',
      earnedAt: body.earnedAt,
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
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('GET error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
