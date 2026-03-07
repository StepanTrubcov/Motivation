const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('Создание резервной копии базы данных с использованием Prisma...');
    
    // Создаем директорию для резервных копий, если её нет
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Получаем текущую дату и время для имени файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `prisma-backup-${timestamp}.json`);
    
    // Получаем все данные из таблиц
    console.log('Получение данных из таблицы User...');
    const users = await prisma.user.findMany({
      include: {
        achievements: true,
      }
    });
    
    console.log('Получение данных из таблицы Goal...');
    const goals = await prisma.goal.findMany();
    
    console.log('Получение данных из таблицы Achievement...');
    const achievements = await prisma.achievement.findMany();
    
    // Создаем объект с резервной копией
    const backupData = {
      timestamp: new Date().toISOString(),
      users,
      goals,
      achievements
    };
    
    // Сохраняем данные в файл
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`Резервная копия успешно создана: ${backupFile}`);
    console.log(`Размер файла: ${fs.statSync(backupFile).size} байт`);
    
    // Очистка старых резервных копий (оставляем только последние 7)
    cleanupOldBackups(backupDir);
    
  } catch (error) {
    console.error('Ошибка при создании резервной копии:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function cleanupOldBackups(backupDir) {
  try {
    const files = fs.readdirSync(backupDir);
    
    // Фильтруем только файлы резервных копий Prisma
    const backupFiles = files.filter(file => file.startsWith('prisma-backup-') && file.endsWith('.json'));
    
    // Сортируем по дате (новые первыми)
    backupFiles.sort((a, b) => {
      const dateA = new Date(a.replace('prisma-backup-', '').replace(/-/g, ':'));
      const dateB = new Date(b.replace('prisma-backup-', '').replace(/-/g, ':'));
      return dateB - dateA;
    });
    
    // Удаляем старые файлы (оставляем только последние 7)
    for (let i = 7; i < backupFiles.length; i++) {
      const filePath = path.join(backupDir, backupFiles[i]);
      fs.unlinkSync(filePath);
      console.log(`Удалена старая резервная копия: ${backupFiles[i]}`);
    }
  } catch (error) {
    console.error('Ошибка при очистке старых резервных копий:', error);
  }
}

// Запускаем функцию резервного копирования
backupDatabase();