const express = require('express');
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { SCALES, calcScales, levelForScore } = require('../utils/scales');

const router = express.Router();

const SCALE_KEYS = Object.keys(SCALES);
const VICTIMIZATION_QUESTIONS = [7, 10, 11, 13];
const ISOLATION_QUESTIONS = [8, 9, 12];

router.get('/', requireAdmin, async (req, res) => {
  const { city, school, grade } = req.query;

  const where = {};
  if (city) where.city = city;
  if (school) where.school = school;
  if (grade) where.grade = Number(grade);

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      answers: {
        include: { question: { select: { number: true, scale: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const allCities = await prisma.submission.findMany({
    distinct: ['city'],
    select: { city: true },
    orderBy: { city: 'asc' },
  });
  const schoolsInCity = await prisma.submission.findMany({
    where: city ? { city } : {},
    distinct: ['school'],
    select: { school: true },
    orderBy: { school: 'asc' },
  });

  // Считаем баллы по 4 шкалам и "сырые" баллы по номерам вопросов для каждой анкеты
  const perSubmission = submissions.map((s) => {
    const answersWithScale = s.answers.map((a) => ({ score: a.score, scale: a.question.scale }));
    const scales = calcScales(answersWithScale);

    const byNumber = {};
    for (const a of s.answers) byNumber[a.question.number] = a.score;

    return {
      id: s.id,
      city: s.city,
      school: s.school,
      grade: s.grade,
      createdAt: s.createdAt,
      scales,
      byNumber,
    };
  });

  const total = perSubmission.length;

  const scaleAverages = {};
  for (const key of SCALE_KEYS) {
    const avg = total ? perSubmission.reduce((sum, p) => sum + p.scales[key].score, 0) / total : 0;
    scaleAverages[key] = {
      ...SCALES[key],
      score: Math.round(avg * 100) / 100,
      level: levelForScore(avg),
    };
  }

  const riskCounts = { victims: 0, aggressors: 0 };
  for (const p of perSubmission) {
    if (p.scales.direct_victim.score > 3.0) riskCounts.victims += 1;
    if (p.scales.direct_aggressor.score > 3.0) riskCounts.aggressors += 1;
  }

  const pctAboveThree = (questionNumbers) => {
    if (total === 0) return 0;
    const count = perSubmission.filter((p) =>
      questionNumbers.some((n) => (p.byNumber[n] ?? 0) > 3.0)
    ).length;
    return Math.round((count / total) * 1000) / 10;
  };

  const safeCount = perSubmission.filter((p) => SCALE_KEYS.every((key) => p.scales[key].score <= 1.0)).length;
  const safetyIndex = total ? Math.round((safeCount / total) * 1000) / 10 : 0;

  res.json({
    total,
    cities: allCities.map((c) => c.city),
    schools: schoolsInCity.map((s) => s.school),
    scaleAverages,
    riskCounts,
    maps: {
      safetyIndex,
      victimizationPct: pctAboveThree(VICTIMIZATION_QUESTIONS),
      isolationPct: pctAboveThree(ISOLATION_QUESTIONS),
    },
    submissions: perSubmission.slice(0, 50),
  });
});

module.exports = router;
