const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase(backupFileName) {
  try {
    if (!backupFileName) {
      console.error('Пожалуйста, укажите имя файла резервной копии');
      console.log('Использование: node restore-prisma.js <имя_файла.json>');
      process.exit(1);
    }
    
    const backupDir = path.join(__dirname, 'backups');
    const backupFile = path.join(backupDir, backupFileName);
    
    // Проверяем, существует ли файл резервной копии
    if (!fs.existsSync(backupFile)) {
      console.error(`Файл резервной копии не найден: ${backupFile}`);
      process.exit(1);
    }
    
    console.log(`Восстановление базы данных из резервной копии: ${backupFile}`);
    
    // Читаем данные из файла резервной копии
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`Резервная копия создана: ${backupData.timestamp}`);
    
    // Подтверждение перед восстановлением
    console.log('\n⚠️  ВНИМАНИЕ: Это действие удалит все текущие данные и заменит их данными из резервной копии!');
    console.log('Введите "confirm" для подтверждения или нажмите Ctrl+C для отмены:');
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        const input = chunk.trim();
        if (input === 'confirm') {
          performRestore(backupData);
        } else {
          console.log('Восстановление отменено');
          process.exit(0);
        }
      }
    });
    
  } catch (error) {
    console.error('Ошибка при восстановлении базы данных:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function performRestore(backupData) {
  try {
    console.log('Начинаем восстановление данных...');
    
    // Удаляем все существующие данные
    console.log('Удаление существующих данных...');
    await prisma.achievement.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Вставка данных пользователей...');
    for (const userData of backupData.users) {
      // Убираем связанные данные для создания пользователя
      const { achievements, ...userWithoutRelations } = userData;
      
      // Преобразуем даты из строк в объекты Date
      if (userWithoutRelations.registrationDate) {
        userWithoutRelations.registrationDate = new Date(userWithoutRelations.registrationDate);
      }
      if (userWithoutRelations.createdAt) {
        userWithoutRelations.createdAt = new Date(userWithoutRelations.createdAt);
      }
      if (userWithoutRelations.updatedAt) {
        userWithoutRelations.updatedAt = new Date(userWithoutRelations.updatedAt);
      }
      
      const user = await prisma.user.create({
        data: userWithoutRelations
      });
      
      console.log(`Создан пользователь: ${user.telegramId}`);
    }
    
    console.log('Вставка данных целей...');
    for (const goalData of backupData.goals) {
      // Преобразуем даты из строк в объекты Date
      if (goalData.startDate) {
        goalData.startDate = new Date(goalData.startDate);
      }
      if (goalData.completionDate) {
        goalData.completionDate = new Date(goalData.completionDate);
      }
      if (goalData.createdAt) {
        goalData.createdAt = new Date(goalData.createdAt);
      }
      if (goalData.updatedAt) {
        goalData.updatedAt = new Date(goalData.updatedAt);
      }
      
      await prisma.goal.create({
        data: goalData
      });
    }
    
    console.log('Вставка данных достижений...');
    for (const achievementData of backupData.achievements) {
      // Преобразуем даты из строк в объекты Date
      if (achievementData.createdAt) {
        achievementData.createdAt = new Date(achievementData.createdAt);
      }
      if (achievementData.updatedAt) {
        achievementData.updatedAt = new Date(achievementData.updatedAt);
      }
      
      await prisma.achievement.create({
        data: achievementData
      });
    }
    
    console.log('✅ Восстановление успешно завершено!');
    
  } catch (error) {
    console.error('Ошибка при восстановлении данных:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Получаем имя файла резервной копии из аргументов командной строки
const backupFileName = process.argv[2];
restoreDatabase(backupFileName);