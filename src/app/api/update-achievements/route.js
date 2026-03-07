// API endpoint для обновления достижений у всех пользователей
// Этот endpoint будет вызываться автоматически при запуске приложения
import { updateAllUserAchievements } from '@/lib/updateAchievements.mjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await updateAllUserAchievements();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка в API endpoint обновления достижений:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Не удалось обновить достижения',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}