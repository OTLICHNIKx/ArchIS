// backend/ports/INotificationService.js
'use strict';

class INotificationService {
  async sendRepostNotification(reposterId, track) {
    throw new Error('INotificationService.sendRepostNotification() не реализован');
  }
}

module.exports = INotificationService;