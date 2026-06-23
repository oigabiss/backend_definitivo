const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');
const { DEVICE_STATUS } = require('../../../shared/config/constants');

const Device = sequelize.define('Device', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
  },
  status: {
    type: DataTypes.ENUM(Object.values(DEVICE_STATUS)),
    defaultValue: DEVICE_STATUS.ACTIVE,
  },
}, {
  tableName: 'devices',
  timestamps: true,
  underscored: true,
});

module.exports = Device;
