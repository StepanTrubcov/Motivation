import { updateAllUserAchievements } from '@/lib/updateAchievements.cjs';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const result = await updateAllUserAchievements();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при обновлении достижений:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Не удалось обновить достижения для пользователей',
      details: error.message 
    }, { status: 500 });
  }
}