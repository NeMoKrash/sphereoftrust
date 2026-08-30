const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const { requireSuperAdmin } = require('../middleware/auth');
const { REGIONS, GRADE_LETTERS } = require('../utils/locations');
const { SCALES, calcScales, levelForScore } = require('../utils/scales');

const router = express.Router();

const SCALE_KEYS = Object.keys(SCALES);

// --- Управление аккаунтами психологов ---

router.get('/admins', requireSuperAdmin, async (req, res) => {
  const admins = await prisma.admin.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, username: true, region: true, city: true, school: true, isSuperAdmin: true },
  });
  res.json(admins);
});

router.post('/admins', requireSuperAdmin, async (req, res) => {
  const { username, password, region, city, school } = req.body;

  if (!username || !password || !region || !city || !school) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  if (!REGIONS.includes(region)) {
    return res.status(400).json({ error: 'Выберите область из списка' });
  }

  if (!/^\d+$/.test(String(school).trim())) {
    return res.status(400).json({ error: 'Номер школы должен быть числом' });
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    return res.status(400).json({ error: `Логин "${username}" уже занят` });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { username, passwordHash, region, city: String(city).trim(), school: String(school).trim() },
  });

  res.status(201).json({ id: admin.id, username: admin.username });
});

router.delete('/admins/:id', requireSuperAdmin, async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: Number(req.params.id) } });
  if (!admin) {
    return res.status(404).json({ error: 'Аккаунт не найден' });
  }
  if (admin.isSuperAdmin) {
    return res.status(400).json({ error: 'Нельзя удалить супер-администратора через этот раздел' });
  }

  await prisma.admin.delete({ where: { id: admin.id } });
  res.json({ ok: true });
});

// --- Общестрановая статистика ---

router.get('/stats', requireSuperAdmin, async (req, res) => {
  const { region, city, school, grade, gradeLetter } = req.query;

  // Обзор всегда считается по всем данным целиком, независимо от фильтров —
  // это верхнеуровневая картина по стране.
  const allSubmissions = await prisma.submission.findMany({
    where: { region: { in: REGIONS } },
    select: {
      region: true,
      city: true,
      school: true,
      answers: { select: { score: true, question: { select: { scale: true } } } },
    },
  });

  // Считаем "безопасна ли анкета" один раз для каждой — переиспользуем это
  // и для странового обзора, и для разбивки по районам/школам ниже.
  const withSafety = allSubmissions.map((s) => {
    const scales = calcScales(s.answers.map((a) => ({ score: a.score, scale: a.question.scale })));
    const isSafe = SCALE_KEYS.every((key) => scales[key].score <= 1.0);
    return { region: s.region, city: s.city, school: s.school, isSafe };
  });

  const schoolKeys = new Set();
  const byRegion = {};
  for (const r of REGIONS) byRegion[r] = { submissions: 0, safeCount: 0 };

  for (const s of withSafety) {
    schoolKeys.add(`${s.region}|${s.city}|${s.school}`);
    if (byRegion[s.region]) {
      byRegion[s.region].submissions += 1;
      if (s.isSafe) byRegion[s.region].safeCount += 1;
    }
  }

  const perRegion = REGIONS.map((r) => {
    const bucket = byRegion[r];
    const safetyIndex = bucket.submissions ? Math.round((bucket.safeCount / bucket.submissions) * 1000) / 10 : 0;
    return { region: r, submissions: bucket.submissions, safetyIndex };
  });

  const overview = {
    totalSubmissions: allSubmissions.length,
    regionsCount: perRegion.filter((r) => r.submissions > 0).length,
    schoolsCount: schoolKeys.size,
    perRegion,
  };

  // Каскадная разбивка для клик-навигации супер-админа: страна → область →
  // район → школа. На каждом шаге группируем уже вычисленные withSafety.
  const groupBy = (items, keyFn) => {
    const map = new Map();
    for (const item of items) {
      const key = keyFn(item);
      if (!map.has(key)) map.set(key, { submissions: 0, safeCount: 0 });
      const bucket = map.get(key);
      bucket.submissions += 1;
      if (item.isSafe) bucket.safeCount += 1;
    }
    return [...map.entries()]
      .map(([key, bucket]) => ({
        key,
        submissions: bucket.submissions,
        safetyIndex: Math.round((bucket.safeCount / bucket.submissions) * 1000) / 10,
      }))
      .sort((a, b) => b.submissions - a.submissions);
  };

  let byDistrict = null;
  let bySchool = null;

  if (region && !school) {
    const inRegion = withSafety.filter((s) => s.region === region);
    if (city) {
      bySchool = groupBy(
        inRegion.filter((s) => s.city === city),
        (s) => s.school
      ).map((r) => ({ school: r.key, submissions: r.submissions, safetyIndex: r.safetyIndex }));
    } else {
      byDistrict = groupBy(inRegion, (s) => s.city).map((r) => ({
        city: r.key,
        submissions: r.submissions,
        safetyIndex: r.safetyIndex,
      }));
    }
  }

  // Отфильтрованный срез — по тем параметрам, что выбрал супер-админ.
  const where = {};
  if (region) where.region = region;
  if (city) where.city = city;
  if (school) where.school = String(school).trim();
  if (grade) where.grade = Number(grade);
  if (gradeLetter && GRADE_LETTERS.includes(gradeLetter)) where.gradeLetter = gradeLetter;

  const filteredSubmissions = await prisma.submission.findMany({
    where,
    include: {
      answers: { include: { question: { select: { number: true, scale: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const perSubmission = filteredSubmissions.map((s) => {
    const answersWithScale = s.answers.map((a) => ({ score: a.score, scale: a.question.scale }));
    return {
      id: s.id,
      region: s.region,
      city: s.city,
      school: s.school,
      grade: s.grade,
      gradeLetter: s.gradeLetter,
      createdAt: s.createdAt,
      scales: calcScales(answersWithScale),
    };
  });

  const total = perSubmission.length;
  const scaleAverages = {};
  for (const key of SCALE_KEYS) {
    const avg = total ? perSubmission.reduce((sum, p) => sum + p.scales[key].score, 0) / total : 0;
    scaleAverages[key] = { ...SCALES[key], score: Math.round(avg * 100) / 100, level: levelForScore(avg) };
  }

  const riskCounts = { victims: 0, aggressors: 0 };
  for (const p of perSubmission) {
    if (p.scales.direct_victim.score > 3.0) riskCounts.victims += 1;
    if (p.scales.direct_aggressor.score > 3.0) riskCounts.aggressors += 1;
  }

  const safeCount = perSubmission.filter((p) => SCALE_KEYS.every((key) => p.scales[key].score <= 1.0)).length;
  const safetyIndex = total ? Math.round((safeCount / total) * 1000) / 10 : 0;

  res.json({
    overview,
    drill: { byDistrict, bySchool },
    filtered: {
      total,
      scaleAverages,
      riskCounts,
      maps: { safetyIndex },
      submissions: perSubmission.slice(0, 100),
    },
  });
});

module.exports = router;
