const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../../../shared/middleware/validate');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);

router.get('/unread/count', notificationController.getUnreadCount);

router.put(
  '/:id/read',
  [
    param('id').isUUID().withMessage('Invalid notification ID'),
    validate,
  ],
  notificationController.markAsRead
);

module.exports = router;
