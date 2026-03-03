const userService = require('./user.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * User Controller
 * Handles HTTP requests for user management
 */
class UserController {
  /**
   * Create a new user (Admin only)
   * @route POST /api/v1/users
   * @access Private (Admin)
   */
  createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);

    ApiResponse.success(res, user, 'User created successfully', HTTP_STATUS.CREATED);
  });

  /**
   * Get all users with pagination and filters
   * @route GET /api/v1/users
   * @access Private (Admin, Manager)
   */
  getAllUsers = catchAsync(async (req, res) => {
    const result = await userService.getAllUsers(req.query);

    ApiResponse.paginated(
      res,
      result.users,
      result.pagination,
      'Users retrieved successfully'
    );
  });

  /**
   * Get user by ID
   * @route GET /api/v1/users/:id
   * @access Private (Admin, Manager)
   */
  getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    ApiResponse.success(res, user, 'User retrieved successfully');
  });

  /**
   * Update user by ID (Admin only)
   * @route PUT /api/v1/users/:id
   * @access Private (Admin)
   */
  updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);

    ApiResponse.success(res, user, 'User updated successfully');
  });

  /**
   * Delete user by ID (Admin only)
   * @route DELETE /api/v1/users/:id
   * @access Private (Admin)
   */
  deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id, req.user._id.toString());

    ApiResponse.success(res, null, 'User deleted successfully');
  });

  /**
   * Get current user profile
   * @route GET /api/v1/users/profile/me
   * @access Private (All authenticated users)
   */
  getMyProfile = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.user._id);

    ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  /**
   * Update current user profile
   * @route PUT /api/v1/users/profile/me
   * @access Private (All authenticated users)
   */
  updateMyProfile = catchAsync(async (req, res) => {
    const user = await userService.updateProfile(req.user._id, req.body);

    ApiResponse.success(res, user, 'Profile updated successfully');
  });

  /**
   * Upload profile image
   * @route POST /api/v1/users/profile/image
   * @access Private (All authenticated users)
   */
  uploadProfileImage = catchAsync(async (req, res) => {
    const user = await userService.uploadProfileImage(req.user._id, req.file);

    ApiResponse.success(res, user, 'Profile image uploaded successfully');
  });

  /**
   * Remove profile image
   * @route DELETE /api/v1/users/profile/image
   * @access Private (All authenticated users)
   */
  removeProfileImage = catchAsync(async (req, res) => {
    const user = await userService.removeProfileImage(req.user._id);

    ApiResponse.success(res, user, 'Profile image removed successfully');
  });

  /**
   * Search users
   * @route GET /api/v1/users/search
   * @access Private (Admin, Manager)
   */
  searchUsers = catchAsync(async (req, res) => {
    const { q, page, pageSize } = req.query;
    const result = await userService.searchUsers(q, parseInt(page) || 1, parseInt(pageSize) || 10);

    ApiResponse.paginated(
      res,
      result.users,
      result.pagination,
      'Search results retrieved successfully'
    );
  });

  /**
   * Get users by role
   * @route GET /api/v1/users/role/:role
   * @access Private (Admin, Manager)
   */
  getUsersByRole = catchAsync(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await userService.getUsersByRole(
      req.params.role,
      parseInt(page) || 1,
      parseInt(pageSize) || 10
    );

    ApiResponse.paginated(
      res,
      result.users,
      result.pagination,
      'Users retrieved successfully'
    );
  });

  /**
   * Get user statistics
   * @route GET /api/v1/users/statistics
   * @access Private (Admin)
   */
  getUserStatistics = catchAsync(async (req, res) => {
    const statistics = await userService.getUserStatistics();

    ApiResponse.success(res, statistics, 'User statistics retrieved successfully');
  });

  /**
   * Toggle user active status
   * @route PATCH /api/v1/users/:id/toggle-status
   * @access Private (Admin)
   */
  toggleUserStatus = catchAsync(async (req, res) => {
    const user = await userService.toggleUserStatus(req.params.id, req.user._id.toString());

    ApiResponse.success(res, user, 'User status updated successfully');
  });
}

module.exports = new UserController();
