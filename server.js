const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const scheduleTasks = require('./src/utils/scheduled-tasks');

const prisma = new PrismaClient();

const app = express();

// Добавляем middleware для парсинга JSON
app.use(express.json());

// Обслуживаем статические файлы Next.js
app.use(express.static(path.join(__dirname, '.next')));

// Обрабатываем API маршруты перед остальными маршрутами
app.use('/api', (req, res, next) => {
  // Для API маршрутов передаем управление Next.js
  if (req.path.startsWith('/api')) {
    next();
  } else {
    next();
  }
});

// Для всех остальных маршрутов возвращаем index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'index.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  
  scheduleTasks();
  
});