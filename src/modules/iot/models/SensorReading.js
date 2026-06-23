const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const SensorReading = sequelize.define('SensorReading', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'device_id',
  },
  temperature: {
    type: DataTypes.FLOAT,
  },
  pressure: {
    type: DataTypes.FLOAT,
  },
  vibration: {
    type: DataTypes.FLOAT,
  },
  recordedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'recorded_at',
  },
}, {
  tableName: 'sensor_readings',
  timestamps: true,
  underscored: true,
});

module.exports = SensorReading;
