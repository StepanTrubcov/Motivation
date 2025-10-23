import { NextResponse } from 'next/server';
import { join } from 'path';

let canvasModule;
try {
  canvasModule = require('canvas');
  console.log('✅ Canvas module loaded successfully');
} catch (error) {
  console.warn('⚠️ Canvas module not available:', error.message);
  canvasModule = null;
}

// Если canvas доступен, регистрируем шрифты
if (canvasModule) {
  try {
    const { registerFont } = canvasModule;
    const fontsDir = join(process.cwd(), 'public', 'fonts');
    registerFont(join(fontsDir, 'Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });
    registerFont(join(fontsDir, 'Inter-Regular.ttf'), { family: 'Inter', weight: 'normal' });
    console.log('✅ Fonts registered successfully');
  } catch (error) {
    console.error('❌ Error registering fonts:', error);
  }
}

export async function POST(request) {
  try {
    const { title, description, image, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Возвращаем заглушку вместо генерации изображения
    // В будущем можно интегрировать альтернативный сервис для генерации изображений
    
    // Формируем URL для placeholder изображения с текстом
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedUsername = encodeURIComponent(`@${username || 'user'}`);
    
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