const iotRepository = require('../repositories/iot.repository');
const { AppError } = require('../../../shared/utils/AppError');
const { EVENTS } = require('../../../shared/config/constants');
const eventBus = require('../../../shared/events/eventBus');

class IotService {
  async createDevice(userId, data) {
    const device = await iotRepository.createDevice({
      ...data,
      userId,
    });

    eventBus.emit(EVENTS.DEVICE_CREATED, { device: device.toJSON() });
    return device;
  }

  async getDevices(userId) {
    return iotRepository.findDevicesByUser(userId);
  }

  async getDevice(deviceId, userId) {
    const device = await iotRepository.findDeviceById(deviceId);
    if (!device) {
      throw new AppError('Device not found', 404);
    }
    if (device.userId !== userId) {
      throw new AppError('Forbidden', 403);
    }
    return device;
  }

  async updateDevice(deviceId, userId, data) {
    await this.getDevice(deviceId, userId);
    return iotRepository.updateDevice(deviceId, data);
  }

  async deleteDevice(deviceId, userId) {
    await this.getDevice(deviceId, userId);
    await iotRepository.deleteDevice(deviceId);
  }

  async receiveSensorData(deviceId, userId, sensorData) {
    const device = await this.getDevice(deviceId, userId);

    const reading = await iotRepository.createSensorReading({
      deviceId,
      ...sensorData,
    });

    eventBus.emit(EVENTS.SENSOR_DATA_RECEIVED, {
      reading: reading.toJSON(),
      device: device.toJSON(),
    });

    return reading;
  }

  async getReadings(deviceId, userId, pagination) {
    await this.getDevice(deviceId, userId);
    return iotRepository.findReadingsByDevice(deviceId, pagination);
  }
}

module.exports = new IotService();
