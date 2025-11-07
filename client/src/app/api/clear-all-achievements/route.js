import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Начинаем удаление всех достижений для всех пользователей...');
    
    // Удаляем все достижения для всех пользователей
    const result = await prisma.achievement.deleteMany({});
    
    console.log(`Удалено достижений: ${result.count}`);
    
    return NextResponse.json({
      success: true,
      message: `Успешно удалено ${result.count} достижений`
    });
  } catch (error) {
    console.error('Ошибка при удалении всех достижений:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Не удалось удалить достижения',
      details: error.message 
    }, { status: 500 });
  }
}