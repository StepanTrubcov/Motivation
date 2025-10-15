const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goalsController');

// Получить все цели пользователя
router.get('/:userId', goalsController.getAllGoals);

// Обновить статус цели
router.put('/:userId/:goalId', goalsController.updateGoalStatus);

// Проверить завершение целей
router.post('/check-completion/:userId', goalsController.checkCompletion);

module.exports = router;
