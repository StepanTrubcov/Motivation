const express = require('express');
const router = express.Router();
const achievementsController = require('../controllers/achievementsController');

// Генерация отчёта
router.post('/generate-report/:telegramId', achievementsController.generateReport);

// Создание share-карточки достижения
router.post('/achievement/share', achievementsController.createShareImage);

module.exports = router;
