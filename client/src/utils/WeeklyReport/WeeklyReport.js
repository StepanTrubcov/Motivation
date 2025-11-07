// Убираем неиспользуемый импорт PrismaClient
const weeklyReport = async () => {
    console.log('Начинаем формирование еженедельного отчета...');
};

const scheduleWeeklyReport = () => {
  console.log('Планировщик отчетов инициализирован');
};

module.exports = {
  weeklyReport,
  scheduleWeeklyReport
};