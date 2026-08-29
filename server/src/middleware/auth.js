const jwt = require('jsonwebtoken');
const prisma = require('../db');

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Нет токена авторизации' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

function requireSuperAdmin(req, res, next) {
  requireAdmin(req, res, () => {
    if (!req.admin.isSuperAdmin) {
      return res.status(403).json({ error: 'Доступ только для супер-администратора' });
    }
    next();
  });
}

module.exports = { requireAdmin, requireSuperAdmin };
