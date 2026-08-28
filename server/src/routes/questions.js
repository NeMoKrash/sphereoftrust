const express = require('express');
const prisma = require('../db');

const router = express.Router();

// Публичный список активных вопросов для прохождения опроса
router.get('/', async (req, res) => {
  const questions = await prisma.question.findMany({
    where: { active: true },
    orderBy: { number: 'asc' },
    select: { id: true, number: true, text: true, textKz: true },
  });
  res.json(questions);
});

module.exports = router;
