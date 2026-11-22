const { AppError } = require('../utils/errors');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`Forbidden: '${req.user?.role}' role is not permitted`, 403, 'FORBIDDEN'));
    }
    next();
  };
};

module.exports = authorize;