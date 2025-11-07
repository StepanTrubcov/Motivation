const cron = require('node-cron');
const { weeklyReport } = require('./WeeklyReport/WeeklyReport');

const scheduleTasks = () => {
  // Задача выполняется ежедневно в 23:59
  cron.schedule('* * * * *', async () => {
    console.log('=== Планировщик: Запуск еженедельного отчета ===');
    try {
      const result = await weeklyReport();
      console.log('Результат выполнения отчета:', result);
      console.log('=== Планировщик: Еженедельный отчет завершен ===');
    } catch (error) {
      console.error('Ошибка при выполнении запланированной задачи:', error);
    }
  });

  console.log('Планировщик задач инициализирован. Еженедельный отчет запланирован на выполнение ежедневно в 23:59.');
};

module.exports = scheduleTasks;