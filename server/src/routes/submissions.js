const express = require('express');
const prisma = require('../db');
const { REGIONS, GRADE_LETTERS } = require('../utils/locations');

const router = express.Router();

// Приём заполненной анкеты. Никакие личные данные ученика не сохраняются.
router.post('/', async (req, res) => {
  const { region, city, school, grade, gradeLetter, answers } = req.body;

  if (!region || !city || !school || !grade || !gradeLetter || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Заполните все поля и ответьте на вопросы' });
  }

  if (!REGIONS.includes(region)) {
    return res.status(400).json({ error: 'Выберите область из списка' });
  }

  if (!GRADE_LETTERS.includes(gradeLetter)) {
    return res.status(400).json({ error: 'Выберите букву класса из списка' });
  }

  const gradeNumber = Number(grade);
  if (!Number.isInteger(gradeNumber) || gradeNumber < 1 || gradeNumber > 11) {
    return res.status(400).json({ error: 'Класс должен быть числом от 1 до 11' });
  }

  const submission = await prisma.submission.create({
    data: {
      region,
      city: String(city).trim(),
      school: String(school).trim(),
      grade: gradeNumber,
      gradeLetter,
      answers: {
        create: answers.map((a) => ({
          questionId: Number(a.questionId),
          score: Number(a.score),
        })),
      },
    },
  });

  res.status(201).json({ id: submission.id });
});

module.exports = router;
