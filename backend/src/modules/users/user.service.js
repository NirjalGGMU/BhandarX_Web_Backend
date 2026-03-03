const userRepository = require('./user.repository');
const AppError = require('../../shared/utils/AppError');
const PaginationHelper = require('../../shared/utils/PaginationHelper');
const FileHelper = require('../../shared/utils/FileHelper');
const { CreateUserDTO, UpdateUserDTO, UpdateProfileDTO, UserFilterDTO } = require('./user.dto');

/**
 * User Service
 * Contains business logic for user management
 */
class UserService {
  /**
   * Create a new user (Admin only)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    const userDTO = new CreateUserDTO(userData);

    // Check if email already exists
    const emailExists = await userRepository.emailExists(userDTO.email);
    if (emailExists) {
      throw new AppError('Email already in use', 400);
    }

    const user = await userRepository.createUser(userDTO);
    return user;
  }

  /**
   * Get all users with pagination and filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Paginated users
   */
  async getAllUsers(filters) {
    const filterDTO = new UserFilterDTO(filters);
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(filters);

    // Build query filters
    const queryFilters = {};

    // Search filter
    if (filterDTO.search) {
      const searchRegex = new RegExp(filterDTO.search, 'i');
      queryFilters.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Role filter
    if (filterDTO.role) {
      queryFilters.role = filterDTO.role;
    }

    // Active status filter
    if (filterDTO.isActive !== undefined) {
      queryFilters.isActive = filterDTO.isActive;
    }

    // Fetch users and total count
    const [users, totalUsers] = await Promise.all([
      userRepository.findAll(queryFilters, skip, pageSize),
      userRepository.countUsers(queryFilters),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalUsers);

    return {
      users,
      pagination,
    };
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Update user by ID (Admin only)
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    const userDTO = new UpdateUserDTO(updateData);

    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being updated and if it's already in use
    if (userDTO.email) {
      const emailExists = await userRepository.emailExists(userDTO.email, userId);
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    const updatedUser = await userRepository.updateById(userId, userDTO);
    return updatedUser;
  }

  /**
   * Delete user by ID (Admin only)
   * @param {string} userId - User ID
   * @param {string} requestingUserId - ID of user making the request
   * @returns {Promise<Object>} Deleted user
   */
  async deleteUser(userId, requestingUserId) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent self-deletion
    if (userId === requestingUserId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    // Delete profile image if exists
    if (user.profileImage) {
      await FileHelper.deleteFile(user.profileImage);
    }

    const deletedUser = await userRepository.deleteById(userId);
    return deletedUser;
  }

  /**
   * Update own profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, updateData) {
    const profileDTO = new UpdateProfileDTO(updateData);

    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being updated and if it's already in use
    if (profileDTO.email) {
      const emailExists = await userRepository.emailExists(profileDTO.email, userId);
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    const updatedUser = await userRepository.updateById(userId, profileDTO);
    return updatedUser;
  }

  /**
   * Upload profile image
   * @param {string} userId - User ID
   * @param {Object} file - Uploaded file
   * @returns {Promise<Object>} Updated user
   */
  async uploadProfileImage(userId, file) {
    if (!file) {
      throw new AppError('Please upload a file', 400);
    }

    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      await FileHelper.deleteFile(user.profileImage);
    }

    // Get relative file path
    const profileImagePath = FileHelper.getRelativeFilePath(file);

    // Update user with new profile image
    const updatedUser = await userRepository.updateProfileImage(userId, profileImagePath);
    return updatedUser;
  }

  /**
   * Remove profile image
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async removeProfileImage(userId) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.profileImage) {
      throw new AppError('No profile image to remove', 400);
    }

    // Delete profile image file
    await FileHelper.deleteFile(user.profileImage);

    // Update user
    const updatedUser = await userRepository.removeProfileImage(userId);
    return updatedUser;
  }

  /**
   * Search users
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number
   * @param {number} pageSize - Page size
   * @returns {Promise<Object>} Paginated search results
   */
  async searchUsers(searchTerm, page = 1, pageSize = 10) {
    const { skip } = PaginationHelper.getPaginationParams({ page, pageSize });
    const totalUsers = await userRepository.countSearchResults(searchTerm);
    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalUsers);

    const users = await userRepository.searchUsers(searchTerm, skip, pageSize);

    return {
      users,
      pagination,
    };
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @param {number} page - Page number
   * @param {number} pageSize - Page size
   * @returns {Promise<Object>} Paginated users
   */
  async getUsersByRole(role, page = 1, pageSize = 10) {
    const { skip } = PaginationHelper.getPaginationParams({ page, pageSize });
    const totalUsers = await userRepository.countUsers({ role });
    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalUsers);

    const users = await userRepository.findByRole(role, skip, pageSize);

    return {
      users,
      pagination,
    };
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics() {
    const [totalUsers, activeUsers, inactiveUsers, usersByRole] = await Promise.all([
      userRepository.countUsers(),
      userRepository.getActiveUsersCount(),
      userRepository.getInactiveUsersCount(),
      userRepository.getUserStatsByRole(),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: usersByRole,
    };
  }

  /**
   * Toggle user active status (Admin only)
   * @param {string} userId - User ID
   * @param {string} requestingUserId - ID of user making the request
   * @returns {Promise<Object>} Updated user
   */
  async toggleUserStatus(userId, requestingUserId) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent deactivating own account
    if (userId === requestingUserId) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    const updatedUser = await userRepository.updateById(userId, {
      isActive: !user.isActive,
    });

    return updatedUser;
  }
}

module.exports = new UserService();
