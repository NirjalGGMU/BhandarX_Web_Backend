const User = require('../auth/User.model');

/**
 * User Repository
 * Handles all database operations for users
 */
class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    const user = await User.create(userData);
    return user;
  }

  /**
   * Find all users with optional filters
   * @param {Object} filters - Filter criteria
   * @param {number} skip - Number of documents to skip
   * @param {number} limit - Number of documents to return
   * @returns {Promise<Array>} Array of users
   */
  async findAll(filters = {}, skip = 0, limit = 10) {
    const users = await User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return users;
  }

  /**
   * Count users with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Count of users
   */
  async countUsers(filters = {}) {
    return await User.countDocuments(filters);
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async findById(userId) {
    return await User.findById(userId).select('-password');
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object
   */
  async findByEmail(email) {
    return await User.findOne({ email }).select('-password');
  }

  /**
   * Find user by email including password
   * @param {string} email - User email
   * @returns {Promise<Object>} User object with password
   */
  async findByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateById(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');
    return user;
  }

  /**
   * Delete user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user
   */
  async deleteById(userId) {
    return await User.findByIdAndDelete(userId).select('-password');
  }

  /**
   * Search users by name or email
   * @param {string} searchTerm - Search term
   * @param {number} skip - Number of documents to skip
   * @param {number} limit - Number of documents to return
   * @returns {Promise<Array>} Array of users
   */
  async searchUsers(searchTerm, skip = 0, limit = 10) {
    const searchRegex = new RegExp(searchTerm, 'i');
    const users = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return users;
  }

  /**
   * Count search results
   * @param {string} searchTerm - Search term
   * @returns {Promise<number>} Count of matching users
   */
  async countSearchResults(searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i');
    return await User.countDocuments({
      $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
    });
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @param {number} skip - Number of documents to skip
   * @param {number} limit - Number of documents to return
   * @returns {Promise<Array>} Array of users
   */
  async findByRole(role, skip = 0, limit = 10) {
    return await User.find({ role })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @param {string} excludeUserId - User ID to exclude from check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email, excludeUserId = null) {
    const query = { email };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const user = await User.findOne(query);
    return !!user;
  }

  /**
   * Update user's last login
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async updateLastLogin(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    ).select('-password');
  }

  /**
   * Get user statistics by role
   * @returns {Promise<Array>} Statistics array
   */
  async getUserStatsByRole() {
    return await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  /**
   * Get active users count
   * @returns {Promise<number>} Count of active users
   */
  async getActiveUsersCount() {
    return await User.countDocuments({ isActive: true });
  }

  /**
   * Get inactive users count
   * @returns {Promise<number>} Count of inactive users
   */
  async getInactiveUsersCount() {
    return await User.countDocuments({ isActive: false });
  }

  /**
   * Update user profile image
   * @param {string} userId - User ID
   * @param {string} profileImage - Profile image path
   * @returns {Promise<Object>} Updated user
   */
  async updateProfileImage(userId, profileImage) {
    return await User.findByIdAndUpdate(userId, { profileImage }, { new: true }).select(
      '-password'
    );
  }

  /**
   * Remove user profile image
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async removeProfileImage(userId) {
    return await User.findByIdAndUpdate(userId, { profileImage: null }, { new: true }).select(
      '-password'
    );
  }
}

module.exports = new UserRepository();
