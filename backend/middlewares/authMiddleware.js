const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new UnauthorizedError('Unauthorized, token missing'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    next(new UnauthorizedError('Token invalid or expired'));
  }
};

module.exports = protect;