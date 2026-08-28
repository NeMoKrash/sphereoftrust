// Создать аккаунт психолога для конкретной школы.
// Использование:
//   node scripts/create-admin.js <username> <password> <region> <city> <school>
// Пример:
//   node scripts/create-admin.js school2 pass123 "Алматинская область" "Талгарский район" "Школа №5"

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { REGIONS } = require('../src/utils/locations');

const prisma = new PrismaClient();

async function main() {
  const [username, password, region, city, school] = process.argv.slice(2);

  if (!username || !password || !region || !city || !school) {
    console.error('Использование: node scripts/create-admin.js <username> <password> <region> <city> <school>');
    console.error('Доступные регионы:');
    REGIONS.forEach((r) => console.error('  - ' + r));
    process.exit(1);
  }

  if (!REGIONS.includes(region)) {
    console.error(`Неизвестный регион: "${region}". Доступные регионы:`);
    REGIONS.forEach((r) => console.error('  - ' + r));
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    console.error(`Пользователь "${username}" уже существует`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { username, passwordHash, region, city, school },
  });

  console.log(`Создан аккаунт: ${admin.username} / ${password}`);
  console.log(`Школа: ${admin.school}, ${admin.city}, ${admin.region}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
