// backend/utils/generateToken.js

const jwt = require('jsonwebtoken');

/**
 * Генерирует JWT токен для пользователя.
 * @param {string} userId — _id пользователя из MongoDB
 * @returns {string} JWT токен, действующий 30 дней
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // payload — что кладём внутрь токена
    process.env.JWT_SECRET,   // секретный ключ из .env
    { expiresIn: '30d' }      // срок жизни токена
  );
};

module.exports = generateToken;