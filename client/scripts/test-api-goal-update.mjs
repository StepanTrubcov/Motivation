import axios from 'axios';

async function testApiGoalUpdate() {
  try {
    console.log('Тестируем обновление цели через API...');
    
    // Используем данные из предыдущего теста
    const userId = 'cmht6uldz0000mhkssbanq2uu';
    const goalId = 'cmht6uldz0000mhkssbanq2uu_3';
    
    // Попробуем обновить статус цели на "in_progress" с selectedOption = 0
    const response = await axios.put(`http://localhost:3000/api/goals/${userId}/${goalId}`, {
      newStatus: 'in_progress',
      selectedOption: 0
    });
    
    console.log('Ответ от API:', response.data);
    
    if (response.status === 200) {
      console.log('✅ Успешно: API обновления цели работает корректно');
      console.log('Обновленная цель:', response.data);
    } else {
      console.log('❌ Ошибка: API вернул статус', response.status);
    }
    
  } catch (error) {
    console.error('Ошибка при тестировании API обновления цели:', error.response?.data || error.message);
  }
}

testApiGoalUpdate();