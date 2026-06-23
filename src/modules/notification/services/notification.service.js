const notificationRepository = require('../repositories/notification.repository');
const Device = require('../../iot/models/Device');
const logger = require('../../../shared/logger/logger');
const { EVENTS } = require('../../../shared/config/constants');
const eventBus = require('../../../shared/events/eventBus');

class NotificationService {
  constructor() {
    this.handleAnomalyDetected = this.handleAnomalyDetected.bind(this);
  }

  registerListeners() {
    eventBus.on(EVENTS.ANOMALY_DETECTED, this.handleAnomalyDetected);
    logger.info('NotificationService: Listening to anomaly events');
  }

  async handleAnomalyDetected(payload) {
    try {
      const { anomaly, device, reading } = payload;
      
      let userId = device.userId;
      
      if (!userId) {
        const deviceData = await Device.findByPk(device.id);
        if (deviceData) {
          userId = deviceData.userId;
        }
      }

      if (!userId) {
        logger.error(`Could not find user for device ${device.id}`);
        return;
      }

      const notification = await notificationRepository.create({
        userId,
        anomalyId: anomaly.id,
        title: `⚠️ Anomalia detectada - ${device.name}`,
        message: `Anomalia de severidade ${anomaly.severity} detectada no dispositivo ${device.name}. Score: ${anomaly.anomalyScore.toFixed(4)}. Temperatura: ${reading.temperature}°C, Pressão: ${reading.pressure} hPa, Vibração: ${reading.vibration} mm/s.`,
        channel: 'log',
        status: 'sent',
        sentAt: new Date(),
      });

      console.log(`
╔══════════════════════════════════════════════╗
║           🚨 ALERTA DE ANOMALIA 🚨           ║
╠══════════════════════════════════════════════╣
║ Dispositivo: ${device.name}
║ Severidade:  ${anomaly.severity}
║ Score:       ${anomaly.anomalyScore.toFixed(4)}
║ Temperatura: ${reading.temperature}°C
║ Pressão:     ${reading.pressure} hPa
║ Vibração:    ${reading.vibration} mm/s
╚══════════════════════════════════════════════╝
      `);

      eventBus.emit(EVENTS.ALERT_SENT, {
        notification: notification.toJSON(),
        anomaly,
      });

    } catch (error) {
      logger.error('Error in NotificationService.handleAnomalyDetected:', error);
    }
  }

  async getNotifications(userId, pagination = {}) {
    return notificationRepository.findByUser(userId, pagination);
  }

  async markAsRead(notificationId) {
    return notificationRepository.markAsRead(notificationId);
  }

  async getUnreadCount(userId) {
    return notificationRepository.countUnread(userId);
  }
}

module.exports = new NotificationService();
