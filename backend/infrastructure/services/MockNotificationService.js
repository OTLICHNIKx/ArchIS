// backend/infrastructure/services/MockNotificationService.js
'use strict';

const INotificationService = require('../../ports/INotificationService');

class MockNotificationService extends INotificationService {
  async sendRepostNotification(reposterId, track) {
    console.log(
      `[NotificationService] ✅ Уведомление отправлено подписчикам пользователя ${reposterId}`
    );
    console.log(`[NotificationService] Трек: "${track.title}" был репостнут`);
    return { success: true, notifiedCount: 42 };
  }
}

module.exports = MockNotificationService;