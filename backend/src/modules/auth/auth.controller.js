const authService = require('./auth.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

class AuthController {
  register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);

    ApiResponse.success(
      res,
      result,
      'User registered successfully',
      HTTP_STATUS.CREATED
    );
  });

  login = catchAsync(async (req, res) => {
    const result = await authService.login(req.body);

    ApiResponse.success(res, result, 'Login successful');
  });

  getProfile = catchAsync(async (req, res) => {
    const user = await authService.getUserProfile(req.user._id);

    ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  updateProfile = catchAsync(async (req, res) => {
    const updatedUser = await authService.updateProfile(req.user._id, req.body);

    ApiResponse.success(res, updatedUser, 'Profile updated successfully');
  });

  changePassword = catchAsync(async (req, res) => {
    const result = await authService.changePassword(req.user._id, req.body);

    ApiResponse.success(res, result, 'Password changed successfully');
  });

  getAllUsers = catchAsync(async (req, res) => {
    const users = await authService.getAllUsers();

    ApiResponse.success(res, users, 'Users retrieved successfully');
  });

  forgotPassword = catchAsync(async (req, res) => {
    const result = await authService.forgotPassword(req.body);

    ApiResponse.success(res, result, 'Password reset email sent');
  });

  resetPassword = catchAsync(async (req, res) => {
    const result = await authService.resetPassword({
      ...req.body,
      token: req.params.token || req.body.token,
    });

    ApiResponse.success(res, result, 'Password reset successfully');
  });
}

module.exports = new AuthController();
