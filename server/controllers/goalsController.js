// Временное хранилище целей (замените на реальную БД)
let goals = [];

const goalsController = {
  // Получить все цели пользователя
  getAllGoals: async (req, res) => {
    try {
      const { userId } = req.params;
      const userGoals = goals.filter(g => g.userId == userId);
      
      res.status(200).json(userGoals);
    } catch (error) {
      console.error('Ошибка получения целей:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Обновить статус цели
  updateGoalStatus: async (req, res) => {
    try {
      const { userId, goalId } = req.params;
      const { newStatus } = req.body;

      const goal = goals.find(g => g.id === goalId && g.userId == userId);
      
      if (!goal) {
        return res.status(404).json({ success: false, message: 'Цель не найдена' });
      }

      goal.status = newStatus;
      
      if (newStatus === 'completed') {
        goal.completionDate = new Date();
      }

      res.status(200).json({ success: true, goal });
    } catch (error) {
      console.error('Ошибка обновления цели:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Проверить завершение целей
  checkCompletion: async (req, res) => {
    try {
      const { userId } = req.params;
      const userGoals = goals.filter(g => g.userId == userId);
      
      const completedGoals = userGoals.filter(g => g.status === 'completed');
      const inProgressGoals = userGoals.filter(g => g.status === 'in_progress');

      res.status(200).json({
        success: true,
        completed: completedGoals.length,
        inProgress: inProgressGoals.length,
        total: userGoals.length
      });
    } catch (error) {
      console.error('Ошибка проверки целей:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  }
};

module.exports = goalsController;
