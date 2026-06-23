const User = require('../../user/models/User');

class AuthRepository {
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async create(data) {
    return User.create(data);
  }

  async findById(id) {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }
}

module.exports = new AuthRepository();
