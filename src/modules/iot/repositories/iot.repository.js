const Device = require('../models/Device');
const SensorReading = require('../models/SensorReading');

class IotRepository {
  async createDevice(data) {
    return Device.create(data);
  }

  async findDevicesByUser(userId) {
    return Device.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
    });
  }

  async findDeviceById(id) {
    return Device.findByPk(id, {
      include: [
        {
          model: SensorReading,
          as: 'readings',
          limit: 10,
          order: [['recorded_at', 'DESC']],
        },
      ],
    });
  }

  async updateDevice(id, data) {
    await Device.update(data, { where: { id } });
    return this.findDeviceById(id);
  }

  async deleteDevice(id) {
    return Device.destroy({ where: { id } });
  }

  async createSensorReading(data) {
    return SensorReading.create(data);
  }

  async findReadingsByDevice(deviceId, { limit = 50, offset = 0 }) {
    return SensorReading.findAndCountAll({
      where: { deviceId },
      limit,
      offset,
      order: [['recorded_at', 'DESC']],
    });
  }

  async findRecentReadings(deviceId, limit = 100) {
    return SensorReading.findAll({
      where: { deviceId },
      limit,
      order: [['recorded_at', 'DESC']],
    });
  }
}

module.exports = new IotRepository();
