const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// scale: direct_victim | indirect_victim | direct_aggressor | indirect_aggressor
const QUESTIONS = [
  {
    number: 1,
    scale: 'direct_aggressor',
    text: 'Я кого-то обозвал',
    textKz: 'Мен біреуді балағаттадым',
  },
  {
    number: 2,
    scale: 'indirect_aggressor',
    text: 'Я с кем-то специально не разговаривал',
    textKz: 'Мен біреумен әдейі сөйлеспедім',
  },
  {
    number: 3,
    scale: 'direct_aggressor',
    text: 'Я нанес кому-то физический вред, например, толкнул или ударил',
    textKz: 'Мен біреуге дене жарақатын келтірдім, мысалы, итердім немесе ұрдым',
  },
  {
    number: 4,
    scale: 'indirect_aggressor',
    text: 'Я распространял о ком-то сплетни',
    textKz: 'Мен біреу туралы өсек тараттым',
  },
  {
    number: 5,
    scale: 'direct_aggressor',
    text: 'Я угрожал',
    textKz: 'Мен қорқыттым',
  },
  {
    number: 6,
    scale: 'direct_aggressor',
    text: 'Я украл или испортил чьи-то вещи',
    textKz: 'Мен біреудің затын ұрладым немесе бүлдірдім',
  },
  {
    number: 7,
    scale: 'direct_victim',
    text: 'Меня обзывали',
    textKz: 'Мені балағаттады',
  },
  {
    number: 8,
    scale: 'indirect_victim',
    text: 'Обо мне распространяли сплетни',
    textKz: 'Мен туралы өсек таратты',
  },
  {
    number: 9,
    scale: 'indirect_victim',
    text: 'Никто не хочет сидеть со мной или проводить свободное время',
    textKz: 'Ешкім менімен отырғысы немесе бос уақыт өткізгісі келмейді',
  },
  {
    number: 10,
    scale: 'direct_victim',
    text: 'У меня украли вещи',
    textKz: 'Менің заттарым ұрланды',
  },
  {
    number: 11,
    scale: 'direct_victim',
    text: 'Мне нанесли физический вред (ударили, толкнули)',
    textKz: 'Маған дене жарақатын келтірді (ұрды, итерді)',
  },
  {
    number: 12,
    scale: 'indirect_victim',
    text: 'Никто не говорит со мной',
    textKz: 'Ешкім менімен сөйлеспейді',
  },
  {
    number: 13,
    scale: 'direct_victim',
    text: 'Мне угрожали',
    textKz: 'Мені қорқытты',
  },
];

const DEMO_ADMIN = {
  username: 'psycholog',
  password: 'bulling2026',
  // Регион специально ВНЕ канонического списка REGIONS, чтобы демо-данные
  // не попадали в публичную общестрановую статистику (/api/public/summary).
  region: 'Демо-регион',
  city: 'Демо-город',
  school: 'Демо-школа',
};

async function main() {
  for (const q of QUESTIONS) {
    await prisma.question.upsert({
      where: { number: q.number },
      update: { textKz: q.textKz },
      create: q,
    });
  }

  const existingAdmin = await prisma.admin.findUnique({ where: { username: DEMO_ADMIN.username } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(DEMO_ADMIN.password, 10);
    await prisma.admin.create({
      data: {
        username: DEMO_ADMIN.username,
        passwordHash,
        region: DEMO_ADMIN.region,
        city: DEMO_ADMIN.city,
        school: DEMO_ADMIN.school,
      },
    });
    console.log(`Создан админ: ${DEMO_ADMIN.username} / ${DEMO_ADMIN.password} (демо-школа)`);
  } else {
    console.log('Админ уже существует, пропускаем');
  }

  console.log('База заполнена вопросами по умолчанию');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
