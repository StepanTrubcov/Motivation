import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Создаем URL для динамической генерации изображения
    const baseUrl = request.nextUrl.origin;
    // Передаем параметры напрямую без дополнительного кодирования
    // Next.js автоматически кодирует параметры при формировании URL
    const imageUrl = new URL(`${baseUrl}/api/achievement/image`);
    imageUrl.searchParams.set('title', title);
    imageUrl.searchParams.set('description', description);
    imageUrl.searchParams.set('points', points || 0);
    imageUrl.searchParams.set('username', username || 'user');

    return NextResponse.json({
      success: true,
      url: imageUrl.toString(),
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