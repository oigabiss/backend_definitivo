const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');
const { ANOMALY_SEVERITY } = require('../../../shared/config/constants');

const Anomaly = sequelize.define('Anomaly', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  readingId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'reading_id',
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'device_id',
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  anomalyScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'anomaly_score',
  },
  details: {
    type: DataTypes.JSON,
  },
  severity: {
    type: DataTypes.ENUM(Object.keys(ANOMALY_SEVERITY).map(k => ANOMALY_SEVERITY[k].label)),
    allowNull: false,
  },
  detectedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'detected_at',
  },
}, {
  tableName: 'anomalies',
  timestamps: true,
  underscored: true,
});

module.exports = Anomaly;
