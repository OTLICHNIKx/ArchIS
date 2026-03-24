// backend/index.js
// ТОЧКА ВХОДА приложения

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Подключаем базу данных
connectDB();

// Глобальные middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключаем роуты
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/tracks'));     // все трековые роуты начинаются с /api

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    architecture: 'Clean Architecture (Ports & Adapters)'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Сервер запущен на порту ${PORT}`);
});