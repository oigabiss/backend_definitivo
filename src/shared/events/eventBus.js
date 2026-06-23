const EventEmitter = require('events');
const logger = require('../logger/logger');
const crypto = require('crypto');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  emit(eventName, payload) {
    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    logger.debug(`[EventBus] Emitting event: ${eventName}`, { eventId, timestamp });
    
    const enrichedPayload = {
      eventId,
      timestamp,
      ...payload
    };

    return super.emit(eventName, enrichedPayload);
  }
}

module.exports = new EventBus();
