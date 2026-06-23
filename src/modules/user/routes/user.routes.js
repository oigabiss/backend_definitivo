const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../../../shared/middleware/validate');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);

router.put(
  '/profile',
  [
    body('name').optional().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
    validate,
  ],
  userController.updateProfile
);

module.exports = router;
