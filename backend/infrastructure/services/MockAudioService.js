// infrastructure/services/MockAudioService.js

'use strict';

const IAudioService = require('../../ports/IAudioService');

class MockAudioService extends IAudioService {

  async process(trackId) {
    console.log(`[AudioService] Обработка трека ${trackId}...`);

    // Симулируем задержку обработки
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
}

module.exports = MockAudioService;