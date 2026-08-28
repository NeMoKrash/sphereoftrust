// Описание 4 шкал методики и расчёт баллов по ответам

const SCALES = {
  direct_victim: {
    label: 'Прямая виктимизация',
    description: 'Ученик подвергается прямой травле: обзывания, физическое насилие, угрозы, кража вещей',
  },
  indirect_victim: {
    label: 'Косвенная виктимизация (отвержение)',
    description: 'Ученика игнорируют, распространяют сплетни, исключают из общения',
  },
  direct_aggressor: {
    label: 'Прямой активный буллинг',
    description: 'Ученик сам проявляет прямую агрессию к другим',
  },
  indirect_aggressor: {
    label: 'Косвенный активный буллинг',
    description: 'Ученик проявляет скрытую агрессию: игнор, сплетни',
  },
};

function levelForScore(score) {
  if (score <= 1.0) return { key: 'low', label: 'Слабо выражен' };
  if (score <= 2.9) return { key: 'medium', label: 'Умеренно выражен' };
  return { key: 'high', label: 'Ярко выражен' };
}

// answersWithScale: [{ score, scale }]
function calcScales(answersWithScale) {
  const sums = {};
  const counts = {};

  for (const key of Object.keys(SCALES)) {
    sums[key] = 0;
    counts[key] = 0;
  }

  for (const a of answersWithScale) {
    if (sums[a.scale] === undefined) continue;
    sums[a.scale] += a.score;
    counts[a.scale] += 1;
  }

  const result = {};
  for (const key of Object.keys(SCALES)) {
    const avg = counts[key] > 0 ? sums[key] / counts[key] : 0;
    result[key] = {
      ...SCALES[key],
      score: Math.round(avg * 100) / 100,
      level: levelForScore(avg),
    };
  }
  return result;
}

module.exports = { SCALES, levelForScore, calcScales };
