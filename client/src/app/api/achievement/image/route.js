import { NextResponse } from 'next/server';
import { createCanvas } from '@napi-rs/canvas';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Достижение';
    const description = searchParams.get('description') || 'Описание достижения';
    const points = searchParams.get('points') || '0';
    const username = searchParams.get('username') || 'user';

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Простой черный фон
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Белый прямоугольник для контента
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(40, 40, width - 80, height - 80);

    // Зеленый заголовок
    ctx.fillStyle = '#00AA00';
    ctx.fillRect(60, 60, width - 120, 100);

    // Текст с очень простыми параметрами
    ctx.fillStyle = '#000000';
    ctx.font = '30px sans-serif';
    ctx.fillText(`@${username}`, 80, 120);

    ctx.fillStyle = '#000000';
    ctx.font = '40px sans-serif';
    ctx.fillText(title.substring(0, 30), 80, 200);

    ctx.fillStyle = '#000000';
    ctx.font = '24px sans-serif';
    ctx.fillText(description.substring(0, 60), 80, 260);

    ctx.fillStyle = '#00AA00';
    ctx.font = '30px sans-serif';
    ctx.fillText(`+${points} очков`, 80, 320);

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
