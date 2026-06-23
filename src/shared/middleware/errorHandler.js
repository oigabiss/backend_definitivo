const { AppError } = require('../utils/AppError');
const logger = require('../logger/logger');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};

module.exports = errorHandler;
