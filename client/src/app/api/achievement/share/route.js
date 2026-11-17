import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, description, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Делаем POST запрос к image API для генерации изображения с ID
    const protocol = new URL(request.url).protocol.slice(0, -1);
    const host = request.headers.get('host') || 'example.com';
    const imageUrl = `${protocol}://${host}/api/achievement/image`;

    // Отправляем данные через POST, чтобы избежать URL-кодирования
    const imageResponse = await fetch(imageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': request.headers.get('x-telegram-init-data') || '',
        'x-development-telegram-id': request.headers.get('x-development-telegram-id') || '',
      },
      body: JSON.stringify({
        title,
        description,
        username: username || 'user'
      })
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to generate image: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();

    return NextResponse.json({
      success: true,
      url: imageData.url, // URL с ID, без параметров в строке запроса
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
