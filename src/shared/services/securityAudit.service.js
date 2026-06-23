const eventBus = require('../events/eventBus');
const logger = require('../logger/logger');
const { EVENTS } = require('../config/constants');

class SecurityAuditService {
  registerListeners() {
    Object.values(EVENTS).forEach((eventName) => {
      eventBus.on(eventName, (payload) => {
        const { eventId, timestamp, ...data } = payload;
        logger.info(`[SecurityAudit] ${eventName}`, {
          eventId,
          timestamp,
          data,
        });
      });
    });

    logger.info('SecurityAuditService: Listening to all system events');
  }
}

module.exports = new SecurityAuditService();
