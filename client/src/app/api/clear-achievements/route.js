import { NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE() {
  try {
    const publicDir = join(process.cwd(), 'public', 'images', 'achievements');
    
    // Проверяем существование директории
    try {
      const files = await readdir(publicDir);
      
      // Удаляем все файлы в директории
      const deletePromises = files.map(file => {
        const filePath = join(publicDir, file);
        return unlink(filePath);
      });
      
      await Promise.all(deletePromises);
      
      return NextResponse.json({
        success: true,
        message: `Удалено ${files.length} файлов`
      });
    } catch (err) {
      // Если директория не существует, это не ошибка
      if (err.code === 'ENOENT') {
        return NextResponse.json({
          success: true,
          message: 'Директория пуста или не существует'
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('❌ Ошибка очистки папки достижений:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка очистки папки достижений',
      error: error.message
    }, { status: 500 });
  }
}