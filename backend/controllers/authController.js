// backend/controllers/authController.js

const bcrypt        = require('bcryptjs');
const User          = require('../models/User');
const generateToken = require('../utils/generateToken');


/* ──────────────────────────────────────────────
   РЕГИСТРАЦИЯ
   POST /api/auth/register
   ────────────────────────────────────────────── */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Проверяем что все поля заполнены
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Заполни все поля' });
    }

    // 2. Проверяем минимальную длину пароля
    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль минимум 6 символов' });
    }

    // 3. Проверяем что пользователь с таким email не существует
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email уже используется' });
    }

    // 4. Проверяем что username не занят
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Имя пользователя уже занято' });
    }

    // 5. Хешируем пароль (число 10 — это "соль", чем больше — тем безопаснее, но медленнее)
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Создаём пользователя в MongoDB
    const user = await User.create({
      username,
      email:    email.toLowerCase(),
      password: hashedPassword,
    });

    // 7. Возвращаем данные пользователя + токен
    res.status(201).json({
      _id:      user._id,
      username: user.username,
      email:    user.email,
      avatar:   user.avatar,
      token:    generateToken(user._id),
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


/* ──────────────────────────────────────────────
   ЛОГИН
   POST /api/auth/login
   ────────────────────────────────────────────── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Проверяем что поля заполнены
    if (!email || !password) {
      return res.status(400).json({ message: 'Введи email и пароль' });
    }

    // 2. Ищем пользователя по email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // 3. Сравниваем введённый пароль с хешем в БД
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
      // Намеренно одинаковое сообщение — чтобы нельзя было угадать что именно неверно
    }

    // 4. Всё ок — возвращаем данные + токен
    res.json({
      _id:      user._id,
      username: user.username,
      email:    user.email,
      avatar:   user.avatar,
      token:    generateToken(user._id),
    });

  } catch (error) {
    console.error('Ошибка логина:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


/* ──────────────────────────────────────────────
   ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
   GET /api/auth/me
   Защищённый роут — требует токен
   ────────────────────────────────────────────── */
const getMe = async (req, res) => {
  // req.user уже заполнен middleware protect
  res.json(req.user);
};


module.exports = { register, login, getMe };