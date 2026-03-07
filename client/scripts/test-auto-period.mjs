import axios from 'axios';

async function testAutoPeriod() {
  try {
    console.log('Тестируем автоматический период для savingGoals...');
    
    // Используем тестового пользователя
    const userId = 'cmi7l0f91001bpeezx2w9fgmf';
    
    // Тестируем автоматический период
    console.log('\n1. Тестируем автоматический период:');
    const autoPeriodResponse = await axios.get(`http://localhost:3000/api/saving-goals?userId=${userId}&autoPeriod=true`);
    
    console.log('Ответ с автоматическим периодом:', autoPeriodResponse.data);
    
    // Тестируем фильтрацию по 30 дням
    console.log('\n2. Тестируем фильтрацию по 30 дням:');
    const filter30Response = await axios.get(`http://localhost:3000/api/saving-goals?userId=${userId}&filterByDays=30`);
    
    console.log('Ответ с фильтрацией по 30 дням:', filter30Response.data);
    
    // Тестируем фильтрацию по 60 дням
    console.log('\n3. Тестируем фильтрацию по 60 дням:');
    const filter60Response = await axios.get(`http://localhost:3000/api/saving-goals?userId=${userId}&filterByDays=60`);
    
    console.log('Ответ с фильтрацией по 60 дням:', filter60Response.data);
    
    // Тестируем фильтрацию по 120 дням
    console.log('\n4. Тестируем фильтрацию по 120 дням:');
    const filter120Response = await axios.get(`http://localhost:3000/api/saving-goals?userId=${userId}&filterByDays=120`);
    
    console.log('Ответ с фильтрацией по 120 дням:', filter120Response.data);
    
    console.log('\n✅ Все тесты пройдены успешно!');
    
  } catch (error) {
    console.error('Ошибка при тестировании автоматического периода:', error.response?.data || error.message);
  }
}

testAutoPeriod();