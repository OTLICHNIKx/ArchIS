// backend/infrastructure/services/MockNotificationService.js
'use strict';

class MockNotificationService {

  /**
   * Отправка уведомления подписчикам о новом репосте
   */
  async sendRepostNotification(reposterId, track) {
    console.log(`[NotificationService] ✅ Уведомление отправлено подписчикам пользователя ${reposterId}`);
    console.log(`[NotificationService] Трек: "${track.title}" был репостнут`);

    // В реальной системе здесь был бы вызов внешнего сервиса
    return { success: true, notifiedCount: 42 }; // заглушка
  }
}

module.exports = MockNotificationService;