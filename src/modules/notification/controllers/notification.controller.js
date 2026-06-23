const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = (page - 1) * limit;

      const result = await notificationService.getNotifications(req.user.id, { limit, offset });
      res.status(200).json({
        status: 'success',
        data: {
          notifications: result.rows,
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

  async markAsRead(req, res, next) {
    try {
      await notificationService.markAsRead(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
