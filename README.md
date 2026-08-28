# Сфера доверия — опросник по буллингу для школьного психолога

Анонимный опрос для учеников + кабинет психолога со статистикой и редактированием вопросов.

## Стек

- Клиент: React + Vite, React Router, recharts (только для графика ролей)
- Сервер: Node.js + Express + Prisma + SQLite
- Авторизация психолога: JWT (один аккаунт, создаётся при сидировании базы)

## Запуск

### 1. Сервер

```
cd server
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Поднимется на http://localhost:4000. Логин психолога после сидирования: `psycholog` / `bulling2026`.

### 2. Клиент

```
cd client
npm install
npm run dev
```

Поднимется на http://localhost:5173, запросы к `/api/*` проксируются на сервер (см. `client/vite.config.js`).

## Структура

- `server/prisma/schema.prisma` — модели Question, Answer, Submission, Admin
- `server/src/utils/scales.js` — какие вопросы относятся к какой из 4 шкал методики, расчёт среднего балла и уровня
- `server/src/routes/stats.js` — агрегированная статистика для кабинета психолога
- `client/src/pages` — экраны: главная, опрос, страница благодарности, вход психолога, дашборд, редактирование вопросов
