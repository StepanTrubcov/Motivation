import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import scheduleTasks from './src/utils/scheduled-tasks.js';

// Для использования __dirname в ES модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const app = express();

app.use(express.static(path.join(__dirname, '.next')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'index.html'));
});

const port = process.env.PORT || 3001;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  
  scheduleTasks();
  
});