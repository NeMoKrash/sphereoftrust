require('dotenv').config();
const express = require('express');
const cors = require('cors');

const questionsRouter = require('./routes/questions');
const submissionsRouter = require('./routes/submissions');
const adminRouter = require('./routes/admin');
const statsRouter = require('./routes/stats');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/questions', questionsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/stats', statsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
