const { AppError } = require('../utils/errors');

const normalizeError = (error) => {
  if (error.name === 'ValidationError') {
    return new AppError('Request validation failed', 400, 'VALIDATION_ERROR',
      Object.values(error.errors).map((item) => item.message));
  }

  if (error.name === 'CastError') {
    return new AppError(`Invalid value for ${error.path}`, 400, 'INVALID_VALUE');
  }

  if (error.code === 11000) {
    return new AppError('A resource with that value already exists', 409, 'DUPLICATE_RESOURCE');
  }

  return error;
};

const errorMiddleware = (error, req, res, next) => {
  const normalized = normalizeError(error);
  const isOperational = normalized instanceof AppError && normalized.isOperational;
  const status = isOperational ? normalized.statusCode : 500;

  if (!isOperational) console.error(error);

  res.status(status).type('application/problem+json').json({
    type: `https://httpstatuses.com/${status}`,
    title: isOperational ? normalized.code : 'INTERNAL_ERROR',
    status,
    detail: isOperational ? normalized.message : 'An unexpected error occurred',
    instance: req.originalUrl,
    ...(isOperational && normalized.details ? { errors: normalized.details } : {})
  });
};

module.exports = errorMiddleware;