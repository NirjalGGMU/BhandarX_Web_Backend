const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const mappedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: mappedErrors[0]?.message || 'Validation failed',
      errors: mappedErrors,
    });
  }
  
  next();
};

module.exports = validate;
