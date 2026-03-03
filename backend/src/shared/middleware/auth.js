const jwt = require('jsonwebtoken');
const config = require('../../config');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { HTTP_STATUS } = require('../constants');
const User = require('../../modules/auth/User.model');

const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', HTTP_STATUS.UNAUTHORIZED));
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('Password recently changed. Please login again.', HTTP_STATUS.UNAUTHORIZED));
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED));
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
