// backend/middleware/auth.js

const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

/**
 * Middleware — проверяет JWT токен в заголовке запроса.
 * Если токен валидный — добавляет пользователя в req.user и пропускает дальше.
 * Если нет — возвращает 401.
 */
const protect = async (req, res, next) => {
  let token;

  // Токен передаётся в заголовке: Authorization: Bearer xxxxx.yyyyy.zzzzz
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Вытаскиваем токен из строки "Bearer xxxxx"
      token = req.headers.authorization.split(' ')[1];

      // Расшифровываем токен — получаем { id: '...' }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя по id из токена, без пароля
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      next(); // всё ок — пропускаем запрос дальше

    } catch (error) {
      console.error('Ошибка токена:', error.message);
      return res.status(401).json({ message: 'Токен недействителен' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Нет токена — доступ запрещён' });
  }
};

module.exports = { protect };