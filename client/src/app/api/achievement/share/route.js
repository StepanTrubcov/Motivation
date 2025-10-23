import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    console.log('Received request with data:', { title, description, points, username });

    if (!title || !description) {
      console.log('Missing required data');
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Формируем URL для placeholder изображения с текстом
    const encodedTitle = encodeURIComponent(title);
    // Using a more reliable placeholder service
    const placeholderUrl = `https://placehold.co/1200x630/0b0b0b/ffffff?text=${encodedTitle}`;
    
    console.log('Generated placeholder URL:', placeholderUrl);
    
    // Возвращаем правильный формат ответа
    const response = {
      success: true,
      url: placeholderUrl,
    };
    
    console.log('Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Ошибка генерации share-картинки:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка генерации изображения',
      url: null
    }, { status: 500 });
  }
}