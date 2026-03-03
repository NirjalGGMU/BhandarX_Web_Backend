const User = require('./User.model');

class AuthRepository {
  async createUser(userData) {
    const user = await User.create(userData);
    return user;
  }

  async findUserByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async updatePassword(id, hashedPassword) {
    return await User.findByIdAndUpdate(id, {
      password: hashedPassword,
      passwordChangedAt: Date.now()
    }, {
      new: true,
    });
  }

  async getAllUsers(filter = {}) {
    return await User.find(filter).select('-password');
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  async checkEmailExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async setResetPasswordToken(id, token, expire) {
    return await User.findByIdAndUpdate(id, {
      resetPasswordToken: token,
      resetPasswordExpire: expire,
    });
  }

  async findUserByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');
  }

  async clearResetPasswordToken(id) {
    return await User.findByIdAndUpdate(id, {
      $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 },
    });
  }
}

module.exports = new AuthRepository();
