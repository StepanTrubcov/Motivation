const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Получить или создать пользователя
router.post('/', usersController.createOrUpdateUser);

// Получить пользователя по Telegram ID
router.get('/:telegramId', usersController.getUserByTelegramId);

// Добавить очки пользователю
router.post('/:userId/pts/increment', usersController.incrementPoints);

// Добавить дату выполнения
router.post('/:userId/completed-dates', usersController.addCompletedDate);

// Получить даты выполнения
router.get('/:userId/completed-dates', usersController.getCompletedDates);

// Достижения пользователя
router.post('/:userId/achievements', usersController.initializeAchievements);
router.get('/:userId/achievements', usersController.getAchievements);
router.put('/:userId/achievements/:achievementId/status', usersController.updateAchievementStatus);

module.exports = router;
