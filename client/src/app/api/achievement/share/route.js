import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Создаем URL для динамической генерации изображения с правильной кодировкой
    const baseUrl = request.nextUrl.origin;
    const imageUrl = `${baseUrl}/api/achievement/image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&points=${encodeURIComponent(points || 0)}&username=${encodeURIComponent(username || 'user')}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
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