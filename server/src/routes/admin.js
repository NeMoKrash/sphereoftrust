const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { SCALES } = require('../utils/scales');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const isValid = await bcrypt.compare(password || '', admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });

  res.json({ token, username: admin.username });
});

router.get('/me', requireAdmin, async (req, res) => {
  const { username, region, city, school } = req.admin;
  res.json({ username, region, city, school });
});

router.get('/questions', requireAdmin, async (req, res) => {
  const questions = await prisma.question.findMany({ orderBy: { number: 'asc' } });
  res.json({ questions, scales: SCALES });
});

router.put('/questions/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { text, textKz, scale, active } = req.body;

  if (scale !== undefined && !SCALES[scale]) {
    return res.status(400).json({ error: 'Неизвестная шкала' });
  }

  const question = await prisma.question.update({
    where: { id: Number(id) },
    data: {
      ...(text !== undefined ? { text } : {}),
      ...(textKz !== undefined ? { textKz } : {}),
      ...(scale !== undefined ? { scale } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    },
  });

  res.json(question);
});

module.exports = router;
