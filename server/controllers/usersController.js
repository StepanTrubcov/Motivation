// Временное хранилище (замените на реальную БД)
let users = [];

const usersController = {
  // Создать или обновить пользователя
  createOrUpdateUser: async (req, res) => {
    try {
      const { telegramId, firstName, username, photoUrl } = req.body;

      // Поиск существующего пользователя
      let user = users.find(u => u.telegramId === telegramId);

      if (user) {
        // Обновление существующего пользователя
        user.firstName = firstName;
        user.username = username;
        user.photoUrl = photoUrl;
        user.lastActive = new Date();
      } else {
        // Создание нового пользователя
        user = {
          id: users.length + 1,
          telegramId,
          firstName,
          username,
          photoUrl,
          points: 0,
          registrationDate: new Date(),
          lastActive: new Date(),
          completedDates: [],
          achievements: []
        };
        users.push(user);
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Ошибка создания/обновления пользователя:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Получить пользователя по Telegram ID
  getUserByTelegramId: async (req, res) => {
    try {
      const { telegramId } = req.params;
      const user = users.find(u => u.telegramId === telegramId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Добавить очки
  incrementPoints: async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount } = req.body;

      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }

      user.points = (user.points || 0) + amount;
      res.status(200).json({ success: true, points: user.points });
    } catch (error) {
      console.error('Ошибка добавления очков:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Добавить дату выполнения
  addCompletedDate: async (req, res) => {
    try {
      const { userId } = req.params;
      const { date } = req.body;

      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }

      if (!user.completedDates) {
        user.completedDates = [];
      }

      if (!user.completedDates.includes(date)) {
        user.completedDates.push(date);
      }

      res.status(200).json({ success: true, completedDates: user.completedDates });
    } catch (error) {
      console.error('Ошибка добавления даты:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Получить даты выполнения
  getCompletedDates: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }

      res.status(200).json(user.completedDates || []);
    } catch (error) {
      console.error('Ошибка получения дат:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Инициализация достижений
  initializeAchievements: async (req, res) => {
    try {
      const { userId } = req.params;
      const { achievements } = req.body;

      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }

      user.achievements = achievements;
      res.status(200).json({ success: true, achievements: user.achievements });
    } catch (error) {
      console.error('Ошибка инициализации достижений:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Получить достижения
  getAchievements: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }

      res.status(200).json(user.achievements || []);
    } catch (error) {
      console.error('Ошибка получения достижений:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  },

  // Обновить статус достижения
  updateAchievementStatus: async (req, res) => {
    try {
      const { userId, achievementId } = req.params;
      const { newStatus } = req.body;

      const user = users.find(u => u.id == userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }

      const achievement = user.achievements?.find(a => a.id == achievementId);
      
      if (!achievement) {
        return res.status(404).json({ success: false, message: 'Достижение не найдено' });
      }

      achievement.status = newStatus;
      res.status(200).json({ success: true, achievement });
    } catch (error) {
      console.error('Ошибка обновления достижения:', error);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  }
};

module.exports = usersController;
