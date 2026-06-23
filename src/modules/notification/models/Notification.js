const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');
const { NOTIFICATION_STATUS, NOTIFICATION_CHANNEL } = require('../../../shared/config/constants');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  anomalyId: {
    type: DataTypes.UUID,
    field: 'anomaly_id',
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM(Object.values(NOTIFICATION_CHANNEL)),
    defaultValue: NOTIFICATION_CHANNEL.LOG,
  },
  status: {
    type: DataTypes.ENUM(Object.values(NOTIFICATION_STATUS)),
    defaultValue: NOTIFICATION_STATUS.PENDING,
  },
  sentAt: {
    type: DataTypes.DATE,
    field: 'sent_at',
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
});

module.exports = Notification;
