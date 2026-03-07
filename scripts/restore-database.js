const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Конфигурация базы данных из .env файла
require('dotenv').config();

// Получаем имя файла резервной копии из аргументов командной строки
const backupFileName = process.argv[2];

if (!backupFileName) {
  console.error('Пожалуйста, укажите имя файла резервной копии');
  console.log('Использование: node restore-database.js <имя_файла.sql>');
  process.exit(1);
}

const backupDir = path.join(__dirname, 'backups');
const backupFile = path.join(backupDir, backupFileName);

// Проверяем, существует ли файл резервной копии
if (!fs.existsSync(backupFile)) {
  console.error(`Файл резервной копии не найден: ${backupFile}`);
  process.exit(1);
}

// Извлекаем параметры подключения из DATABASE_URL
const dbUrl = process.env.DIRECT_DATABASE_URL;
if (!dbUrl) {
  console.error('DIRECT_DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

const urlParts = new URL(dbUrl);
const user = urlParts.username;
const password = urlParts.password;
const host = urlParts.hostname;
const port = urlParts.port || '5432';
const database = urlParts.pathname.substring(1);

// Команда для восстановления из резервной копии
const restoreCommand = `psql -h ${host} -p ${port} -U ${user} -d ${database} < ${backupFile}`;

console.log(`Восстановление базы данных из резервной копии...`);
console.log(`Файл: ${backupFile}`);
console.log(`Команда: ${restoreCommand}`);

// Устанавливаем переменную окружения для пароля
const env = { ...process.env, PGPASSWORD: password };

exec(restoreCommand, { env }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Ошибка при восстановлении базы данных: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Предупреждение: ${stderr}`);
  }
  
  console.log(`База данных успешно восстановлена из резервной копии: ${backupFile}`);
});