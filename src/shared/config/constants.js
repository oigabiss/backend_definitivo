const EVENTS = {
  USER_CREATED: 'user.created',
  USER_LOGGED: 'user.logged',
  DEVICE_CREATED: 'device.created',
  SENSOR_DATA_RECEIVED: 'sensor.data.received',
  ANOMALY_DETECTED: 'anomaly.detected',
  ALERT_SENT: 'alert.sent',
};

const ANOMALY_THRESHOLD = 0.6;

const ANOMALY_SEVERITY = {
  LOW: { min: 0.6, max: 0.7, label: 'low' },
  MEDIUM: { min: 0.7, max: 0.8, label: 'medium' },
  HIGH: { min: 0.8, max: 0.9, label: 'high' },
  CRITICAL: { min: 0.9, max: 1.0, label: 'critical' },
};

const DEVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  READ: 'read',
};

const NOTIFICATION_CHANNEL = {
  EMAIL: 'email',
  LOG: 'log',
  WEBSOCKET: 'websocket',
};

module.exports = {
  EVENTS,
  ANOMALY_THRESHOLD,
  ANOMALY_SEVERITY,
  DEVICE_STATUS,
  NOTIFICATION_STATUS,
  NOTIFICATION_CHANNEL,
};
