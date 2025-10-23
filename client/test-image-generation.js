// Тест для проверки генерации изображений
const axios = require('axios');

async function testImageGeneration() {
  try {
    console.log('Тестируем генерацию изображения...');
    
    const testData = {
      title: "Тестовое достижение",
      description: "Это тестовое описание достижения для проверки работы генерации изображений на Vercel",
      points: 100,
      username: "testuser"
    };
    
    const response = await axios.post('http://localhost:3000/api/achievement/share', testData);
    
    if (response.data.success) {
      console.log('✅ Генерация изображения успешна!');
      console.log('URL изображения:', response.data.url.substring(0, 100) + '...');
    } else {
      console.log('❌ Ошибка генерации:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

testImageGeneration();