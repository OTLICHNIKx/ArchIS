const express = require('express');
const router  = express.Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  res.json({ message: 'Профиль пользователя — в разработке', id: req.params.id });
});

module.exports = router;