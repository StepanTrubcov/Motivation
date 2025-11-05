// API endpoint для обновления достижений у всех пользователей
// Этот endpoint будет вызываться автоматически при запуске приложения
const { updateAllUserAchievements } = require('@/lib/updateAchievements.cjs');
const { NextResponse } = require('next/server');

async function GET() {
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

async function POST() {
  return GET();
}

module.exports = { GET, POST };