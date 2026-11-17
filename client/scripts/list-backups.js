const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, 'backups');

// Проверяем, существует ли директория с резервными копиями
if (!fs.existsSync(backupDir)) {
  console.log('Директория с резервными копиями не найдена');
  process.exit(0);
}

// Читаем содержимое директории
fs.readdir(backupDir, (err, files) => {
  if (err) {
    console.error(`Ошибка при чтении директории: ${err.message}`);
    process.exit(1);
  }
  
  // Фильтруем файлы резервных копий (и .sql, и .json)
  const backupFiles = files.filter(file => 
    (file.startsWith('backup-') && file.endsWith('.sql')) ||
    ((file.startsWith('prisma-backup-') || file.startsWith('progress-full-')) && file.endsWith('.json'))
  );
  
  if (backupFiles.length === 0) {
    console.log('Резервные копии не найдены');
    process.exit(0);
  }
  
  // Сортируем по дате (новые первыми)
  backupFiles.sort((a, b) => {
    // Извлекаем дату из имени файла
    const dateA = getDateFromFilename(a);
    const dateB = getDateFromFilename(b);
    return dateB - dateA;
  });
  
  console.log('Доступные резервные копии:');
  console.log('==========================');
  
  backupFiles.forEach((file, index) => {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / (1024 * 1024)).toFixed(2); // Размер в МБ
    const fileDate = getDateFromFilename(file);
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Дата: ${fileDate.toLocaleString()}`);
    console.log(`   Размер: ${fileSize} МБ`);
    console.log(`   Тип: ${file.endsWith('.sql') ? 'PostgreSQL' : 'Prisma JSON'}`);
    console.log('');
  });
});

function getDateFromFilename(filename) {
  const match = filename.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/);
  return match ? new Date(Date.UTC(+match[1],+match[2]-1,+match[3],+match[4],+match[5],+match[6],+match[7])) : new Date(0);
}
