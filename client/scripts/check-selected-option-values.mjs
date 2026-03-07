import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSelectedOptionValues() {
  try {
    console.log('Проверяем значения selectedOption в базе данных...');
    
    // Получаем все цели
    const goals = await prisma.goal.findMany();
    console.log(`Всего целей: ${goals.length}`);
    
    // Группируем цели по значениям selectedOption
    const groupedBySelectedOption = {};
    
    goals.forEach(goal => {
      const key = goal.selectedOption === null ? 'null' : goal.selectedOption;
      if (!groupedBySelectedOption[key]) {
        groupedBySelectedOption[key] = [];
      }
      groupedBySelectedOption[key].push(goal);
    });
    
    // Выводим статистику
    Object.keys(groupedBySelectedOption).forEach(key => {
      console.log(`selectedOption = ${key}: ${groupedBySelectedOption[key].length} целей`);
    });
    
    // Проверяем конкретную цель, которая вызывает ошибку
    const problemGoal = await prisma.goal.findUnique({
      where: { id: 'cmi7l0f91001bpeezx2w9fgmf_3' }
    });
    
    if (problemGoal) {
      console.log('\nПроблемная цель:');
      console.log('ID:', problemGoal.id);
      console.log('Title:', problemGoal.title);
      console.log('selectedOption:', problemGoal.selectedOption);
      console.log('Тип selectedOption:', typeof problemGoal.selectedOption);
    } else {
      console.log('\nПроблемная цель не найдена');
    }
    
  } catch (error) {
    console.error('Ошибка при проверке значений selectedOption:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSelectedOptionValues();