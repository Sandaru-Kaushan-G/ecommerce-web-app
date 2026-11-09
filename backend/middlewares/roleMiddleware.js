const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: '${req.user?.role}' role is not permitted`
      });
    }
    next();
  };
};

module.exports = authorize;