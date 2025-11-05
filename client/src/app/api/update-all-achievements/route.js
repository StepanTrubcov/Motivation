const { updateAllUserAchievements } = require('@/lib/updateAchievements.cjs');
const { NextResponse } = require('next/server');

async function POST(request) {
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

module.exports = { POST };