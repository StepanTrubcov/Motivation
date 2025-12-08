import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Возвращаем данные для генерации изображения через POST запрос
    // Это предотвратит URL-кодирование параметров
    return NextResponse.json({
      success: true,
      title,
      description,
      points: points || 0,
      username: username || 'user',
      url: `${request.nextUrl.origin}/api/achievement/image`, // URL для POST запроса
      method: 'POST'
    });
  } catch (error) {
    console.error('❌ Ошибка генерации share-картинки:', error);
    // Возвращаем placeholder изображение в случае ошибки
    return NextResponse.json({
      success: true,
      url: 'https://placehold.co/1200x630/0b0b0b/ffffff?text=Ошибка+генерации',
    }, { status: 200 });
  }
}