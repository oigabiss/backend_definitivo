const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../../../shared/middleware/validate');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 3, max: 100 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.login
);

router.get(
  '/me',
  authMiddleware,
  authController.getProfile
);

module.exports = router;
