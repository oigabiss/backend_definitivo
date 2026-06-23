const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async update(id, data) {
    await User.update(data, { where: { id } });
    return this.findById(id);
  }
}

module.exports = new UserRepository();
