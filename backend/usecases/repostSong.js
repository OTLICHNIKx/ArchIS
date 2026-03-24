// backend/usecases/repostSong.js
'use strict';

const { validateRepost } = require('../domain/Repost');

function makeRepostSong({ trackRepository, repostRepository, notificationService }) {

  return async function repostSong(songId, userId) {

    // 1. Проверяем, существует ли трек
    const track = await trackRepository.findById(songId);
    if (!track) {
      const err = new Error('Трек не найден');
      err.status = 404;
      throw err;
    }

    // 2. Проверяем, что трек публичный (по требованиям Практики 1)
    if (track.isPublic === false) {
      const err = new Error('Песня приватная, репост невозможен');
      err.status = 403;
      throw err;
    }

    // 3. Проверяем дубликат репоста
    const existingRepost = await repostRepository.findByUserAndSong(userId, songId);
    if (existingRepost) {
      const err = new Error('Вы уже репостнули этот трек');
      err.status = 400;
      throw err;
    }

    // 4. Валидация через domain
    const errors = validateRepost({ songId, userId });
    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.status = 400;
      throw err;
    }

    // 5. Создаём репост
    const repost = await repostRepository.create({
      songId,
      userId,
      timestamp: new Date()
    });

    // 6. Увеличиваем счётчик репостов у трека
    const newRepostCount = (track.repostCount || 0) + 1;
    await trackRepository.update(songId, { repostCount: newRepostCount });

    // 7. Отправляем уведомления подписчикам (заглушка)
    if (notificationService) {
      await notificationService.sendRepostNotification(userId, track).catch(console.error);
    }

    console.log(`[Repost] Пользователь ${userId} репостнул трек ${songId}`);

    return {
      id: repost._id || repost.id,
      songId: repost.songId,
      userId: repost.userId,
      timestamp: repost.timestamp,
      repostCount: newRepostCount
    };
  };
}

module.exports = makeRepostSong;