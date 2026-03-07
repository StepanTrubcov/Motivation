import { updateAllUserAchievements } from '@/lib/updateAchievements';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const result = await updateAllUserAchievements();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при создании достижений:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Не удалось создать достижения для пользователей',
      details: error.message 
    }, { status: 500 });
  }
}