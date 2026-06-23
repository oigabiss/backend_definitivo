const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../../../shared/middleware/validate');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/anomalies', analyticsController.getAnomalies);
router.get('/', analyticsController.getAnomalies);

router.get(
  '/devices/:id/stats',
  [
    param('id').isUUID().withMessage('Invalid device ID'),
    validate,
  ],
  analyticsController.getDeviceStats
);

router.get(
  '/anomalies/:id',
  [
    param('id').isUUID().withMessage('Invalid anomaly ID'),
    validate,
  ],
  analyticsController.getAnomalyById
);

module.exports = router;
