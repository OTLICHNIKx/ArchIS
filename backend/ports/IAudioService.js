// ports/IAudioService.js
// Интерфейс внешнего сервиса обработки аудио

'use strict';

class IAudioService {

  /**
   * Отправить трек на обработку.
   * @param {string} trackId
   * @returns {{ success: boolean, errorMessage?: string }}
   */
  async process(trackId) {
    throw new Error('IAudioService.process() не реализован');
  }

}

module.exports = IAudioService;
