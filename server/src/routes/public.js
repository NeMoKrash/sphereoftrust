const express = require('express');
const prisma = require('../db');
const { REGIONS } = require('../utils/locations');
const { SCALES, calcScales } = require('../utils/scales');

const router = express.Router();

const SCALE_KEYS = Object.keys(SCALES);

// Публичная общестрановая статистика без авторизации. Отдаёт только
// агрегированные показатели по каноническим 20 регионам РК — никаких
// сырых анкет, городов или названий школ наружу не идёт.
router.get('/summary', async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { region: { in: REGIONS } },
    select: {
      region: true,
      city: true,
      school: true,
      answers: {
        select: { score: true, question: { select: { scale: true } } },
      },
    },
  });

  const schoolKeys = new Set();
  const byRegion = {};
  for (const region of REGIONS) {
    byRegion[region] = { submissions: 0, safeCount: 0 };
  }

  for (const s of submissions) {
    schoolKeys.add(`${s.region}|${s.city}|${s.school}`);

    const answersWithScale = s.answers.map((a) => ({ score: a.score, scale: a.question.scale }));
    const scales = calcScales(answersWithScale);
    const isSafe = SCALE_KEYS.every((key) => scales[key].score <= 1.0);

    byRegion[s.region].submissions += 1;
    if (isSafe) byRegion[s.region].safeCount += 1;
  }

  const perRegion = REGIONS.map((region) => {
    const bucket = byRegion[region];
    const safetyIndex = bucket.submissions
      ? Math.round((bucket.safeCount / bucket.submissions) * 1000) / 10
      : 0;
    return { region, submissions: bucket.submissions, safetyIndex };
  });

  res.json({
    totalSubmissions: submissions.length,
    regionsCount: perRegion.filter((r) => r.submissions > 0).length,
    schoolsCount: schoolKeys.size,
    perRegion,
  });
});

module.exports = router;
