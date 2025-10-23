import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Возвращаем заглушку вместо генерации изображения
    // Формируем URL для placeholder изображения с текстом
    const encodedTitle = encodeURIComponent(title);
    
    // Используем сервис placeholder.com для генерации изображения с текстом
    const placeholderUrl = `https://via.placeholder.com/1200x630/0b0b0b/ffffff.png?text=${encodedTitle}`;
    
    return NextResponse.json({
      success: true,
      url: placeholderUrl,
    });
  } catch (error) {
    console.error('❌ Ошибка генерации share-картинки:', error);
    return NextResponse.json({ success: false, message: 'Ошибка генерации изображения' }, { status: 500 });
  }
}
