const express = require('express');
const router  = express.Router();
const Track   = require('../models/Track');

// GET /api/tracks — все публичные треки
router.get('/', async (req, res) => {
  try {
    const tracks = await Track.find({ isPublic: true })
      .populate('artist', 'username avatar')   // подтягиваем данные автора
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tracks/:id — один трек
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate('artist', 'username avatar');
    if (!track) return res.status(404).json({ message: 'Трек не найден' });
    res.json(track);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tracks — создать трек
router.post('/', async (req, res) => {
  try {
    const track = new Track(req.body);
    const saved = await track.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tracks/:id — удалить трек
router.delete('/:id', async (req, res) => {
  try {
    await Track.findByIdAndDelete(req.params.id);
    res.json({ message: 'Трек удалён' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;