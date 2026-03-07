import axios from 'axios';

async function detailedTestGoalUpdate() {
  try {
    console.log('Детальное тестирование обновления цели...');
    
    // Используем данные из ошибки
    const userId = 'cmi7l0f91001bpeezx2w9fgmf';
    const goalId = 'cmi7l0f91001bpeezx2w9fgmf_3';
    
    // Сначала получим текущую цель
    console.log('Получаем текущую цель...');
    const getCurrentGoal = await axios.get(`http://localhost:3000/api/goals/${userId}`);
    const goals = getCurrentGoal.data;
    const targetGoal = goals.find(goal => goal.id === goalId);
    
    console.log('Текущая цель:', targetGoal);
    
    // Теперь попробуем обновить статус цели на "in_progress" с тем же selectedOption
    console.log('\nОбновляем статус цели...');
    const requestData = {
      newStatus: 'in_progress',
      selectedOption: targetGoal?.selectedOption || 30
    };
    
    console.log('Отправляемые данные:', requestData);
    
    const response = await axios.put(`http://localhost:3000/api/goals/${userId}/${goalId}`, requestData);
    
    console.log('Ответ от API:', response.data);
    
    if (response.status === 200) {
      console.log('✅ Успешно: API обновления цели работает корректно');
      console.log('Обновленная цель:', response.data);
    } else {
      console.log('❌ Ошибка: API вернул статус', response.status);
    }
    
  } catch (error) {
    console.error('Ошибка при детальном тестировании API обновления цели:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Детали ошибки:', error.response.data);
    }
  }
}

detailedTestGoalUpdate();