const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../../../shared/middleware/validate');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const iotController = require('../controllers/iot.controller');
const { DEVICE_STATUS } = require('../../../shared/config/constants');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/devices',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('location').optional().isString(),
    validate,
  ],
  iotController.createDevice
);

router.get('/devices', iotController.getDevices);

router.get(
  '/devices/:id',
  [
    param('id').isUUID().withMessage('Invalid device ID'),
    validate,
  ],
  iotController.getDevice
);

router.put(
  '/devices/:id',
  [
    param('id').isUUID().withMessage('Invalid device ID'),
    body('name').optional().isString(),
    body('type').optional().isString(),
    body('location').optional().isString(),
    body('status').optional().isIn(Object.values(DEVICE_STATUS)).withMessage('Invalid status'),
    validate,
  ],
  iotController.updateDevice
);

router.delete(
  '/devices/:id',
  [
    param('id').isUUID().withMessage('Invalid device ID'),
    validate,
  ],
  iotController.deleteDevice
);

router.post(
  '/devices/:id/data',
  [
    param('id').isUUID().withMessage('Invalid device ID'),
    body('temperature').optional().isFloat(),
    body('pressure').optional().isFloat(),
    body('vibration').optional().isFloat(),
    validate,
  ],
  iotController.receiveSensorData
);

router.get(
  '/devices/:id/readings',
  [
    param('id').isUUID().withMessage('Invalid device ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  iotController.getReadings
);

module.exports = router;
