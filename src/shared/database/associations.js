const sequelize = require('./connection');

// Import models
const User = require('../../modules/user/models/User');
const Device = require('../../modules/iot/models/Device');
const SensorReading = require('../../modules/iot/models/SensorReading');
const Anomaly = require('../../modules/analytics/models/Anomaly');
const Notification = require('../../modules/notification/models/Notification');

// Define Associations
User.hasMany(Device, { foreignKey: 'user_id', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Device.hasMany(SensorReading, { foreignKey: 'device_id', as: 'readings' });
SensorReading.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

SensorReading.hasMany(Anomaly, { foreignKey: 'reading_id', as: 'anomalies' });
Anomaly.belongsTo(SensorReading, { foreignKey: 'reading_id', as: 'reading' });

Device.hasMany(Anomaly, { foreignKey: 'device_id', as: 'device_anomalies' });
Anomaly.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

Anomaly.hasMany(Notification, { foreignKey: 'anomaly_id', as: 'notifications' });
Notification.belongsTo(Anomaly, { foreignKey: 'anomaly_id', as: 'anomaly' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Device,
  SensorReading,
  Anomaly,
  Notification,
};
