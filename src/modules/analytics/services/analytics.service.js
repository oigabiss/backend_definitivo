const analyticsRepository = require('../repositories/analytics.repository');
const SensorReading = require('../../iot/models/SensorReading');
const { AppError } = require('../../../shared/utils/AppError');
const logger = require('../../../shared/logger/logger');
const { EVENTS, ANOMALY_THRESHOLD, ANOMALY_SEVERITY } = require('../../../shared/config/constants');
const eventBus = require('../../../shared/events/eventBus');
const { IsolationForest } = require('../utils/isolationForest');

class AnalyticsService {
  constructor() {
    this.handleSensorData = this.handleSensorData.bind(this);
  }

  registerListeners() {
    eventBus.on(EVENTS.SENSOR_DATA_RECEIVED, this.handleSensorData);
    logger.info('AnalyticsService: Listening to sensor data events');
  }

  getSeverity(score) {
    if (score >= ANOMALY_SEVERITY.CRITICAL.min) return ANOMALY_SEVERITY.CRITICAL.label;
    if (score >= ANOMALY_SEVERITY.HIGH.min) return ANOMALY_SEVERITY.HIGH.label;
    if (score >= ANOMALY_SEVERITY.MEDIUM.min) return ANOMALY_SEVERITY.MEDIUM.label;
    if (score >= ANOMALY_SEVERITY.LOW.min) return ANOMALY_SEVERITY.LOW.label;
    return 'normal';
  }

  async handleSensorData(payload) {
    try {
      const { reading, device } = payload;

      const recentReadings = await SensorReading.findAll({
        where: { deviceId: device.id },
        order: [['recorded_at', 'DESC']],
        limit: 100,
        raw: true
      });

      if (recentReadings.length < 10) {
        logger.debug(`Analytics: Not enough data for device ${device.id} to run Isolation Forest`);
        return;
      }

      const features = recentReadings.map(r => [
        r.temperature || 0,
        r.pressure || 0,
        r.vibration || 0
      ]);

      const newPoint = [
        reading.temperature || 0,
        reading.pressure || 0,
        reading.vibration || 0
      ];

      const iforest = new IsolationForest({ numTrees: 100, sampleSize: Math.min(256, features.length) });
      iforest.fit(features);
      const score = iforest.predict(newPoint);

      logger.debug(`Analytics: Anomaly score for reading ${reading.id} is ${score}`);

      if (score > ANOMALY_THRESHOLD) {
        const severity = this.getSeverity(score);
        
        const anomaly = await analyticsRepository.createAnomaly({
          readingId: reading.id,
          deviceId: device.id,
          type: 'isolation_forest',
          anomalyScore: score,
          severity,
          details: { features: newPoint },
        });

        logger.warn(`Anomaly Detected on device ${device.id}! Score: ${score}, Severity: ${severity}`);

        eventBus.emit(EVENTS.ANOMALY_DETECTED, {
          anomaly: anomaly.toJSON(),
          device,
          reading,
        });
      }

    } catch (error) {
      logger.error('Error in AnalyticsService.handleSensorData:', error);
    }
  }

  async getAnomalies(userId) {
    return analyticsRepository.findAnomaliesByUser(userId);
  }

  async getAnomalyById(id) {
    const anomaly = await analyticsRepository.findAnomalyById(id);
    if (!anomaly) {
      throw new AppError('Anomaly not found', 404);
    }
    return anomaly;
  }

  async getDeviceStats(deviceId) {
    return analyticsRepository.getDeviceStats(deviceId);
  }
}

module.exports = new AnalyticsService();
