const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Конфигурация базы данных из .env файла
require('dotenv').config();

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, 'backups');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

// Создаем директорию для резервных копий, если её нет
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Извлекаем параметры подключения из DATABASE_URL
// Формат: postgresql://user:password@host:port/database
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

// Команда для создания резервной копии
const dumpCommand = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} > ${backupFile}`;

console.log(`Создание резервной копии базы данных...`);
console.log(`Команда: ${dumpCommand}`);

// Устанавливаем переменную окружения для пароля
const env = { ...process.env, PGPASSWORD: password };

exec(dumpCommand, { env }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Ошибка при создании резервной копии: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Предупреждение: ${stderr}`);
  }
  
  console.log(`Резервная копия успешно создана: ${backupFile}`);
  console.log(`Размер файла: ${fs.statSync(backupFile).size} байт`);
});

// Очистка старых резервных копий (оставляем только последние 7)
const cleanupOldBackups = () => {
  fs.readdir(backupDir, (err, files) => {
    if (err) return;
    
    // Фильтруем только файлы резервных копий
    const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.sql'));
    
    // Сортируем по дате (новые первыми)
    backupFiles.sort((a, b) => {
      const dateA = new Date(a.replace('backup-', '').replace(/-/g, ':'));
      const dateB = new Date(b.replace('backup-', '').replace(/-/g, ':'));
      return dateB - dateA;
    });
    
    // Удаляем старые файлы (оставляем только последние 7)
    for (let i = 7; i < backupFiles.length; i++) {
      const filePath = path.join(backupDir, backupFiles[i]);
      fs.unlinkSync(filePath);
      console.log(`Удалена старая резервная копия: ${backupFiles[i]}`);
    }
  });
};

// Запускаем очистку после создания резервной копии
setTimeout(cleanupOldBackups, 5000);