import axios from 'axios';

async function testSelectedOptionZero() {
  try {
    console.log('Тестируем обновление цели с selectedOption = 0...');
    
    // Используем данные из ошибки
    const userId = 'cmi7l0f91001bpeezx2w9fgmf';
    const goalId = 'cmi7l0f91001bpeezx2w9fgmf_3';
    
    // Попробуем обновить статус цели на "in_progress" с selectedOption = 0
    const response = await axios.put(`http://localhost:3000/api/goals/${userId}/${goalId}`, {
      newStatus: 'in_progress',
      selectedOption: 0
    });
    
    console.log('Ответ от API:', response.data);
    
    if (response.status === 200) {
      console.log('✅ Успешно: API обновления цели работает корректно с selectedOption = 0');
      console.log('Обновленная цель:', response.data);
    } else {
      console.log('❌ Ошибка: API вернул статус', response.status);
    }
    
  } catch (error) {
    console.error('Ошибка при тестировании API обновления цели с selectedOption = 0:', error.response?.data || error.message);
  }
}

testSelectedOptionZero();