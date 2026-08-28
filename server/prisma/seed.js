const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// scale: direct_victim | indirect_victim | direct_aggressor | indirect_aggressor
const QUESTIONS = [
  { number: 1, scale: 'direct_aggressor', text: 'Я кого-то обозвал' },
  { number: 2, scale: 'indirect_aggressor', text: 'Я с кем-то специально не разговаривал' },
  { number: 3, scale: 'direct_aggressor', text: 'Я нанес кому-то физический вред, например, толкнул или ударил' },
  { number: 4, scale: 'indirect_aggressor', text: 'Я распространял о ком-то сплетни' },
  { number: 5, scale: 'direct_aggressor', text: 'Я угрожал' },
  { number: 6, scale: 'direct_aggressor', text: 'Я украл или испортил чьи-то вещи' },
  { number: 7, scale: 'direct_victim', text: 'Меня обзывали' },
  { number: 8, scale: 'indirect_victim', text: 'Обо мне распространяли сплетни' },
  { number: 9, scale: 'indirect_victim', text: 'Никто не хочет сидеть со мной или проводить свободное время' },
  { number: 10, scale: 'direct_victim', text: 'У меня украли вещи' },
  { number: 11, scale: 'direct_victim', text: 'Мне нанесли физический вред (ударили, толкнули)' },
  { number: 12, scale: 'indirect_victim', text: 'Никто не говорит со мной' },
  { number: 13, scale: 'direct_victim', text: 'Мне угрожали' },
];

const ADMIN_USERNAME = 'psycholog';
const ADMIN_PASSWORD = 'bulling2026';

async function main() {
  for (const q of QUESTIONS) {
    await prisma.question.upsert({
      where: { number: q.number },
      update: {},
      create: q,
    });
  }

  const existingAdmin = await prisma.admin.findUnique({ where: { username: ADMIN_USERNAME } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.admin.create({
      data: { username: ADMIN_USERNAME, passwordHash },
    });
    console.log(`Создан админ: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
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
