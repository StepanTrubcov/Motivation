const { weeklyReport } = require('./src/utils/WeeklyReport/WeeklyReport');

async function testWeeklyReport() {
  console.log('Тестирование функции еженедельного отчета...');
  const result = await weeklyReport();
  console.log('Результат:', result);
}

testWeeklyReport();