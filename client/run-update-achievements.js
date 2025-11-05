// Скрипт для запуска обновления достижений через API
// Запуск: node run-update-achievements.js

const https = require('https');

async function runUpdate() {
  try {
    console.log('Отправляем запрос на обновление достижений для всех пользователей...');
    
    // Отправляем POST запрос к API endpoint
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/update-all-achievements',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Результат обновления:', result);
        } catch (parseError) {
          console.log('Ответ от сервера:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Ошибка при отправке запроса:', error);
      console.log('Убедитесь, что ваше приложение запущено на порту 3000');
    });
    
    req.end();
    
  } catch (error) {
    console.error('Ошибка при запуске обновления:', error);
  }
}

// Запускаем скрипт
runUpdate();