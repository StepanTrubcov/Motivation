import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSelectedOptionField() {
  try {
    console.log('Добавляем поле selectedOption в таблицу Goal...');
    
    // Выполняем SQL-запрос для добавления поля
    await prisma.$executeRaw`
      ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "selectedOption" INTEGER;
    `;
    
    console.log('Поле selectedOption успешно добавлено в таблицу Goal');
    
  } catch (error) {
    console.error('Ошибка при добавлении поля selectedOption:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSelectedOptionField();