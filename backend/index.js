require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const app = express();

// Подключаем БД
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // адрес фронта
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роуты
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/users',  require('./routes/users'));

// Базовый healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));