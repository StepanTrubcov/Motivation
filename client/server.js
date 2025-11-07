const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const scheduleTasks = require('./src/utils/scheduled-tasks');

const prisma = new PrismaClient();

const app = express();

// Serve static files from the client/.next directory
app.use(express.static(path.join(__dirname, '.next')));

// Handle all routes by serving the Next.js app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'index.html'));
});

const port = process.env.PORT || 3001;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  
  // Инициализируем планировщик задач
  scheduleTasks();
  
  // Удаляем все достижения при запуске сервера
  try {
    console.log('Удаляем все достижения для всех пользователей...');
    const result = await prisma.achievement.deleteMany({});
    console.log(`Успешно удалено ${result.count} достижений`);
  } catch (error) {
    console.error('Ошибка при удалении всех достижений:', error);
  }
});