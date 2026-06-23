const Notification = require('../models/Notification');
const Anomaly = require('../../analytics/models/Anomaly');

class NotificationRepository {
  async create(data) {
    return Notification.create(data);
  }

  async findByUser(userId, { limit = 50, offset = 0 }) {
    return Notification.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id) {
    return Notification.findByPk(id, {
      include: [
        { model: Anomaly, as: 'anomaly' }
      ]
    });
  }

  async markAsRead(id) {
    await Notification.update({ status: 'read' }, { where: { id } });
    return this.findById(id);
  }

  async countUnread(userId) {
    return Notification.count({
      where: { userId, status: 'pending' }
    });
  }
}

module.exports = new NotificationRepository();
