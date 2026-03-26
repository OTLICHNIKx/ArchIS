// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// GraphQL адаптер (должен быть перед express.json())
const graphqlAdapter = require('./adapters/http/graphqlAdapter');

const app = express();

// Подключаем базу данных
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));

// GraphQL маршрут — идёт ДО express.json()
app.use('/graphql', graphqlAdapter);

// JSON-парсер для REST-эндпоинтов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST-роуты
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/tracks'));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});