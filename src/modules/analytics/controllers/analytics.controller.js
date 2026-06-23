const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  async getAnomalies(req, res, next) {
    try {
      const anomalies = await analyticsService.getAnomalies(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { anomalies },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnomalyById(req, res, next) {
    try {
      const anomaly = await analyticsService.getAnomalyById(req.params.id);
      
      if (anomaly.device && anomaly.device.userId !== req.user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      res.status(200).json({
        status: 'success',
        data: { anomaly },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceStats(req, res, next) {
    try {
      const stats = await analyticsService.getDeviceStats(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
