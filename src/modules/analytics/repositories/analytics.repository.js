const Anomaly = require('../models/Anomaly');
const SensorReading = require('../../iot/models/SensorReading');
const Device = require('../../iot/models/Device');

class AnalyticsRepository {
  async createAnomaly(data) {
    return Anomaly.create(data);
  }

  async findAnomaliesByDevice(deviceId, { limit = 50, offset = 0 }) {
    return Anomaly.findAndCountAll({
      where: { deviceId },
      limit,
      offset,
      order: [['detected_at', 'DESC']],
      include: [
        { model: SensorReading, as: 'reading' }
      ]
    });
  }

  async findAnomaliesByUser(userId) {
    return Anomaly.findAll({
      include: [
        { 
          model: Device, 
          as: 'device',
          where: { userId }
        },
        { model: SensorReading, as: 'reading' }
      ],
      order: [['detected_at', 'DESC']],
      limit: 50,
    });
  }

  async findAnomalyById(id) {
    return Anomaly.findByPk(id, {
      include: [
        { model: SensorReading, as: 'reading' },
        { model: Device, as: 'device' }
      ]
    });
  }

  async getDeviceStats(deviceId) {
    const totalReadings = await SensorReading.count({ where: { deviceId } });
    const totalAnomalies = await Anomaly.count({ where: { deviceId } });
    const recentAnomalies = await Anomaly.findAll({
      where: { deviceId },
      order: [['detected_at', 'DESC']],
      limit: 5,
    });

    return {
      totalReadings,
      totalAnomalies,
      recentAnomalies,
    };
  }
}

module.exports = new AnalyticsRepository();
