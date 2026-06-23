const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const { AppError } = require('../../../shared/utils/AppError');
const { EVENTS } = require('../../../shared/config/constants');
const eventBus = require('../../../shared/events/eventBus');

class AuthService {
  async register({ name, email, password }) {
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await authRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    eventBus.emit(EVENTS.USER_CREATED, {
      userId: user.id,
      email: user.email,
    });

    return userWithoutPassword;
  }

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    eventBus.emit(EVENTS.USER_LOGGED, {
      userId: user.id,
      email: user.email,
    });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

module.exports = new AuthService();
