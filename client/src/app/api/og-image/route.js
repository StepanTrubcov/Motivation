// route.js для Next.js (Node runtime) - отдельный эндпоинт для получения изображений по ID
import { NextResponse } from 'next/server';
import { IMAGES, cleanupExpired } from '../achievement/image/route';

export const runtime = 'nodejs';

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