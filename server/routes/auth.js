const express = require('express');
const router  = express.Router();

router.post('/register', async (req, res) => {
  res.json({ message: 'register — в разработке' });
});

router.post('/login', async (req, res) => {
  res.json({ message: 'login — в разработке' });
});

module.exports = router;