const iotService = require('../services/iot.service');

class IotController {
  async createDevice(req, res, next) {
    try {
      const device = await iotService.createDevice(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDevices(req, res, next) {
    try {
      const devices = await iotService.getDevices(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDevice(req, res, next) {
    try {
      const device = await iotService.getDevice(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDevice(req, res, next) {
    try {
      const device = await iotService.updateDevice(req.params.id, req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDevice(req, res, next) {
    try {
      await iotService.deleteDevice(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Device deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async receiveSensorData(req, res, next) {
    try {
      const reading = await iotService.receiveSensorData(req.params.id, req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        data: { reading },
      });
    } catch (error) {
      next(error);
    }
  }

  async getReadings(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = (page - 1) * limit;

      const result = await iotService.getReadings(req.params.id, req.user.id, { limit, offset });
      
      res.status(200).json({
        status: 'success',
        data: {
          readings: result.rows,
          meta: {
            total: result.count,
            page,
            limit,
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IotController();
