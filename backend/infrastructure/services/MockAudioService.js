// infrastructure/services/MockAudioService.js
// Заглушка внешнего сервиса обработки аудио
// В реальной системе здесь был бы вызов внешнего API

'use strict';

const IAudioService = require('../../ports/IAudioService');

class MockAudioService extends IAudioService {

  async process(trackId) {
    console.log(`[AudioService] Обработка трека ${trackId}...`);

    // Симулируем задержку обработки
    await new Promise(resolve => setTimeout(resolve, 500));

    // Всегда возвращаем успех (в реальности — вызов внешнего API)
    return { success: true };
  }
}

module.exports = MockAudioService;