// Создать (или обновить, если логин уже есть) аккаунт психолога для школы.
// Использование:
//   node scripts/create-admin.js <username> <password> <region> <city> <schoolNumber>
// Пример:
//   node scripts/create-admin.js school2 pass123 "Алматинская область" "Талгарский район" 5
//
// Номер школы — только цифры (без "№"), так же как вводят ученики в форме на сайте:
// иначе анкеты учеников не найдутся по этой школе.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { REGIONS } = require('../src/utils/locations');

const prisma = new PrismaClient();

async function main() {
  const [username, password, region, city, school] = process.argv.slice(2);

  if (!username || !password || !region || !city || !school) {
    console.error('Использование: node scripts/create-admin.js <username> <password> <region> <city> <schoolNumber>');
    console.error('Доступные регионы:');
    REGIONS.forEach((r) => console.error('  - ' + r));
    process.exit(1);
  }

  if (!REGIONS.includes(region)) {
    console.error(`Неизвестный регион: "${region}". Доступные регионы:`);
    REGIONS.forEach((r) => console.error('  - ' + r));
    process.exit(1);
  }

  if (!/^\d+$/.test(school)) {
    console.error(`Номер школы должен быть просто числом, без "№": получено "${school}"`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.admin.findUnique({ where: { username } });

  let admin;
  if (existing) {
    admin = await prisma.admin.update({
      where: { username },
      data: { passwordHash, region, city, school },
    });
    console.log(`Обновлён аккаунт: ${admin.username} / ${password}`);
  } else {
    admin = await prisma.admin.create({
      data: { username, passwordHash, region, city, school },
    });
    console.log(`Создан аккаунт: ${admin.username} / ${password}`);
  }

  console.log(`Школа: №${admin.school}, ${admin.city}, ${admin.region}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
