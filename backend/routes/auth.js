// backend/routes/auth.js

const express            = require('express');
const router             = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect }        = require('../middleware/auth');

// POST /api/auth/register — публичный
router.post('/register', register);

// POST /api/auth/login — публичный
router.post('/login', login);

// GET /api/auth/me — только для авторизованных
router.get('/me', protect, getMe);

module.exports = router;