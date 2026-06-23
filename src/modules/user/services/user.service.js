const userRepository = require('../repositories/user.repository');
const { AppError } = require('../../../shared/utils/AppError');

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId, data) {
    const updateData = {};
    if (data.name) updateData.name = data.name;

    const user = await userRepository.update(userId, updateData);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }
}

module.exports = new UserService();
