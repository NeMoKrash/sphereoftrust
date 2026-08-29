// Создать супер-админ-аккаунт (видит всю статистику по РК, выдаёт доступы школам).
// Использование:
//   node scripts/create-superadmin.js <username> <password>

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.error('Использование: node scripts/create-superadmin.js <username> <password>');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.admin.findUnique({ where: { username } });

  let admin;
  if (existing) {
    admin = await prisma.admin.update({
      where: { username },
      data: { passwordHash, isSuperAdmin: true },
    });
    console.log(`Обновлён супер-админ: ${admin.username} / ${password}`);
  } else {
    admin = await prisma.admin.create({
      data: {
        username,
        passwordHash,
        region: '—',
        city: '—',
        school: '0',
        isSuperAdmin: true,
      },
    });
    console.log(`Создан супер-админ: ${admin.username} / ${password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
