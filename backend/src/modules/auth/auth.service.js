const authRepository = require('./auth.repository');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const {
  RegisterUserDTO,
  LoginUserDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} = require('./auth.dto');
const bcrypt = require('bcryptjs');
const TokenHelper = require('../../shared/utils/TokenHelper');

class AuthService {
  async register(userData) {
    const registerDTO = new RegisterUserDTO(userData);

    // Check if user already exists
    const emailExists = await authRepository.checkEmailExists(registerDTO.email);
    if (emailExists) {
      throw new AppError('Email already registered', HTTP_STATUS.CONFLICT);
    }

    // Create user
    const user = await authRepository.createUser(registerDTO);

    // Generate token
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    return {
      user,
      token,
      refreshToken,
    };
  }

  async login(credentials) {
    const loginDTO = new LoginUserDTO(credentials);

    // Find user by email
    const user = await authRepository.findUserByEmail(loginDTO.email);

    if (!user) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', HTTP_STATUS.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(loginDTO.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    // Update last login
    await authRepository.updateLastLogin(user._id);

    // Generate tokens
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    // Remove password from response
    user.password = undefined;

    return {
      user,
      token,
      refreshToken,
    };
  }

  async getUserProfile(userId) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const updateDTO = new UpdateProfileDTO(updateData);

    // Check if email is being changed and if it already exists
    if (updateDTO.email) {
      const user = await authRepository.findUserById(userId);
      if (user.email !== updateDTO.email) {
        const emailExists = await authRepository.checkEmailExists(updateDTO.email);
        if (emailExists) {
          throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);
        }
      }
    }

    const updatedUser = await authRepository.updateUser(userId, updateDTO);

    if (!updatedUser) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return updatedUser;
  }

  async changePassword(userId, passwordData) {
    const changePasswordDTO = new ChangePasswordDTO(passwordData);

    // Get user with password
    const user = await authRepository.findUserByEmail(
      (await authRepository.findUserById(userId)).email
    );

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(changePasswordDTO.currentPassword);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(changePasswordDTO.newPassword, salt);

    // Update password
    await authRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  async getAllUsers() {
    return await authRepository.getAllUsers({ isActive: true });
  }

  async forgotPassword(emailData) {
    const forgotPasswordDTO = new ForgotPasswordDTO(emailData);

    // Find user by email
    const user = await authRepository.findUserByEmail(forgotPasswordDTO.email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const { resetToken, hashedToken } = TokenHelper.generateResetToken();

    // Set token expiry (15 minutes)
    const tokenExpiry = Date.now() + 15 * 60 * 1000;

    // Save hashed token to database
    await authRepository.setResetPasswordToken(user._id, hashedToken, tokenExpiry);

    // Send email with resetToken
    const isDev = process.env.NODE_ENV !== 'production';

    // In development, we skip actual email sending to avoid SMTP issues and allow "same page" flow
    if (!isDev) {
      try {
        const emailService = require('../../shared/services/email.service');
        await emailService.sendPasswordResetEmail(user, resetToken);
      } catch (error) {
        const logger = require('../../config/logger');
        logger.error(`Failed to send reset email: ${error.message}`);
        // In production, we throw so the user knows it failed
        throw error;
      }
    } else {
      const logger = require('../../config/logger');
      logger.info(`[DEV MODE] Skipping email delivery. Reset Token: ${resetToken}`);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const devResetLink = isDev ? `${frontendUrl}/reset-password/${resetToken}` : undefined;

    return {
      message: 'If the email exists, a password reset link has been sent',
      ...(isDev && { devResetLink }),
    };
  }

  async resetPassword(resetData) {
    const resetPasswordDTO = new ResetPasswordDTO(resetData);

    // Hash the token from URL
    const hashedToken = TokenHelper.hashToken(resetPasswordDTO.token);

    // Find user by hashed token and check if not expired
    const user = await authRepository.findUserByResetToken(hashedToken);

    if (!user) {
      throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(resetPasswordDTO.newPassword, salt);

    // Update password
    await authRepository.updatePassword(user._id, hashedPassword);

    // Clear reset token
    await authRepository.clearResetPasswordToken(user._id);

    // Generate tokens for automatic login
    const token = user.generateToken();

    return {
      message: 'Password reset successfully',
      user,
      token
    };
  }
}

module.exports = new AuthService();
