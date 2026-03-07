// px jest __tests__/backend.modules.test.js --runInBand

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const flushPromises = () => new Promise(setImmediate);

const loadUserService = () => {
  jest.resetModules();

  const userRepository = {
    emailExists: jest.fn(),
    createUser: jest.fn(),
    findAll: jest.fn(),
    countUsers: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    updateProfileImage: jest.fn(),
    removeProfileImage: jest.fn(),
    countSearchResults: jest.fn(),
    searchUsers: jest.fn(),
    findByRole: jest.fn(),
    getActiveUsersCount: jest.fn(),
    getInactiveUsersCount: jest.fn(),
    getUserStatsByRole: jest.fn(),
  };

  const paginationHelper = {
    getPaginationParams: jest.fn(),
    getPaginationMetadata: jest.fn(),
  };

  const fileHelper = {
    deleteFile: jest.fn(),
    getRelativeFilePath: jest.fn(),
  };

  jest.doMock('../src/modules/users/user.repository', () => userRepository);
  jest.doMock('../src/shared/utils/PaginationHelper', () => paginationHelper);
  jest.doMock('../src/shared/utils/FileHelper', () => fileHelper);

  const service = require('../src/modules/users/user.service');
  const AppError = require('../src/shared/utils/AppError');

  return { service, userRepository, paginationHelper, fileHelper, AppError };
};

const loadAuthService = () => {
  jest.resetModules();

  const authRepository = {
    checkEmailExists: jest.fn(),
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    updateLastLogin: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn(),
    getAllUsers: jest.fn(),
    setResetPasswordToken: jest.fn(),
    findUserByResetToken: jest.fn(),
    clearResetPasswordToken: jest.fn(),
  };

  const tokenHelper = {
    generateResetToken: jest.fn(),
    hashToken: jest.fn(),
  };

  const bcrypt = {
    genSalt: jest.fn(),
    hash: jest.fn(),
  };

  const logger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  jest.doMock('../src/modules/auth/auth.repository', () => authRepository);
  jest.doMock('../src/shared/utils/TokenHelper', () => tokenHelper);
  jest.doMock('bcryptjs', () => bcrypt);
  jest.doMock('../src/config/logger', () => logger);

  const service = require('../src/modules/auth/auth.service');
  const AppError = require('../src/shared/utils/AppError');

  return { service, authRepository, tokenHelper, bcrypt, logger, AppError };
};

const loadUserController = () => {
  jest.resetModules();

  const userService = {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    updateProfile: jest.fn(),
    uploadProfileImage: jest.fn(),
    removeProfileImage: jest.fn(),
    searchUsers: jest.fn(),
    getUsersByRole: jest.fn(),
    getUserStatistics: jest.fn(),
    toggleUserStatus: jest.fn(),
  };

  const apiResponse = {
    success: jest.fn(),
    paginated: jest.fn(),
  };

  jest.doMock('../src/modules/users/user.service', () => userService);
  jest.doMock('../src/shared/utils/ApiResponse', () => apiResponse);

  const controller = require('../src/modules/users/user.controller');

  return { controller, userService, apiResponse };
};

const loadAuthController = () => {
  jest.resetModules();

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    getUserProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    getAllUsers: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const apiResponse = {
    success: jest.fn(),
    paginated: jest.fn(),
  };

  jest.doMock('../src/modules/auth/auth.service', () => authService);
  jest.doMock('../src/shared/utils/ApiResponse', () => apiResponse);

  const controller = require('../src/modules/auth/auth.controller');

  return { controller, authService, apiResponse };
};

describe('Backend Jest Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
    delete process.env.FRONTEND_URL;
  });

  describe('Utilities', () => {
    test('ApiResponse.success should send a successful JSON response', () => {
      // Verifies the success helper formats status, message, and data correctly.
      const ApiResponse = require('../src/shared/utils/ApiResponse');
      const res = createMockRes();

      ApiResponse.success(res, { id: 1 }, 'Created', 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created',
        data: { id: 1 },
      });
    });

    test('ApiResponse.error should include the optional errors object', () => {
      // Verifies the error helper emits a consistent error payload.
      const ApiResponse = require('../src/shared/utils/ApiResponse');
      const res = createMockRes();

      ApiResponse.error(res, 'Validation failed', 400, [{ field: 'email' }]);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'email' }],
      });
    });

    test('ApiResponse.paginated should normalize pagination fields', () => {
      // Verifies paginated responses expose only the expected pagination metadata.
      const ApiResponse = require('../src/shared/utils/ApiResponse');
      const res = createMockRes();

      ApiResponse.paginated(
        res,
        [{ id: 1 }],
        { page: 2, pageSize: 10, totalItems: 35, totalPages: 4, hasNext: true, hasPrev: true, extra: 'x' },
        'Users retrieved successfully'
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: [{ id: 1 }],
        pagination: {
          page: 2,
          pageSize: 10,
          totalItems: 35,
          totalPages: 4,
          hasNext: true,
          hasPrev: true,
        },
      });
    });

    test('PaginationHelper.getPaginationParams should parse and clamp values', () => {
      // Verifies pagination params honor numeric inputs and derive skip correctly.
      const PaginationHelper = require('../src/shared/utils/PaginationHelper');

      const result = PaginationHelper.getPaginationParams({ page: '3', pageSize: '20' });

      expect(result).toEqual({ page: 3, pageSize: 20, skip: 40 });
    });

    test('PaginationHelper.getPaginationParams should fall back to defaults for invalid values', () => {
      // Verifies invalid page values are sanitized to the minimum valid pagination state.
      const PaginationHelper = require('../src/shared/utils/PaginationHelper');

      const result = PaginationHelper.getPaginationParams({ page: '0', pageSize: '-5' });

      expect(result.page).toBe(1);
      expect(result.pageSize).toBeGreaterThanOrEqual(1);
      expect(result.skip).toBe(0);
    });

    test('PaginationHelper.getPaginationMetadata should compute navigation flags', () => {
      // Verifies metadata reports next and previous page availability correctly.
      const PaginationHelper = require('../src/shared/utils/PaginationHelper');

      expect(PaginationHelper.getPaginationMetadata(2, 10, 35)).toEqual({
        page: 2,
        pageSize: 10,
        totalItems: 35,
        totalPages: 4,
        hasNext: true,
        hasPrev: true,
      });
    });

    test('TokenHelper.generateResetToken should return raw and hashed tokens', () => {
      // Verifies reset token generation returns both values needed for forgot-password flow.
      const TokenHelper = require('../src/shared/utils/TokenHelper');

      const result = TokenHelper.generateResetToken();

      expect(result.resetToken).toHaveLength(64);
      expect(result.hashedToken).toHaveLength(64);
      expect(result.resetToken).not.toBe(result.hashedToken);
    });

    test('TokenHelper.hashToken should deterministically hash the same token', () => {
      // Verifies token hashing is stable for identical inputs.
      const TokenHelper = require('../src/shared/utils/TokenHelper');

      const firstHash = TokenHelper.hashToken('sample-token');
      const secondHash = TokenHelper.hashToken('sample-token');

      expect(firstHash).toBe(secondHash);
    });

    test('catchAsync should forward rejected async errors to next', async () => {
      // Verifies controller wrappers correctly delegate async failures to Express error handling.
      const catchAsync = require('../src/shared/utils/catchAsync');
      const next = jest.fn();
      const handler = catchAsync(async () => {
        throw new Error('boom');
      });

      handler({}, {}, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }));
    });

    test('AppError should expose status metadata for client errors', () => {
      // Verifies operational app errors carry consistent metadata for downstream handlers.
      const AppError = require('../src/shared/utils/AppError');
      const error = new AppError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    test('TokenHelper.hashToken should produce different hashes for different values', () => {
      // Verifies distinct token inputs do not collapse to the same hash output.
      const TokenHelper = require('../src/shared/utils/TokenHelper');

      expect(TokenHelper.hashToken('token-a')).not.toBe(TokenHelper.hashToken('token-b'));
    });
  });

  describe('User Service', () => {
    test('createUser should persist a new user when email is unused', async () => {
      // Verifies the service creates a user only after passing the duplicate-email check.
      const { service, userRepository } = loadUserService();
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.createUser.mockResolvedValue({ _id: 'u1', email: 'new@example.com' });

      const result = await service.createUser({ name: 'New User', email: 'new@example.com', password: 'secret123' });

      expect(userRepository.emailExists).toHaveBeenCalledWith('new@example.com');
      expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' }));
      expect(result).toEqual({ _id: 'u1', email: 'new@example.com' });
    });

    test('createUser should reject duplicate emails', async () => {
      // Verifies the service prevents creating a user when the email already exists.
      const { service, userRepository, AppError } = loadUserService();
      userRepository.emailExists.mockResolvedValue(true);

      await expect(service.createUser({ email: 'taken@example.com' })).rejects.toEqual(
        expect.objectContaining({ message: 'Email already in use', statusCode: 400 })
      );
      expect(AppError).toBeDefined();
    });

    test('getAllUsers should build filters and return paginated users', async () => {
      // Verifies the service delegates search filters and pagination to the repository layer.
      const { service, userRepository, paginationHelper } = loadUserService();
      paginationHelper.getPaginationParams.mockReturnValue({ page: 2, pageSize: 5, skip: 5 });
      paginationHelper.getPaginationMetadata.mockReturnValue({ page: 2, pageSize: 5, totalItems: 7, totalPages: 2, hasNext: false, hasPrev: true });
      userRepository.findAll.mockResolvedValue([{ _id: 'u1' }]);
      userRepository.countUsers.mockResolvedValue(7);

      const result = await service.getAllUsers({ search: 'ram', role: 'admin', isActive: 'true', page: 2, pageSize: 5 });

      expect(userRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'admin',
          isActive: 'true',
          $or: expect.any(Array),
        }),
        5,
        5
      );
      expect(result).toEqual({
        users: [{ _id: 'u1' }],
        pagination: { page: 2, pageSize: 5, totalItems: 7, totalPages: 2, hasNext: false, hasPrev: true },
      });
    });

    test('getUserById should throw when the user does not exist', async () => {
      // Verifies missing users are surfaced as a not-found domain error.
      const { service, userRepository } = loadUserService();
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getUserById('missing')).rejects.toEqual(
        expect.objectContaining({ message: 'User not found', statusCode: 404 })
      );
    });

    test('updateUser should reject when the target user does not exist', async () => {
      // Verifies update operations stop early when the target record cannot be found.
      const { service, userRepository } = loadUserService();
      userRepository.findById.mockResolvedValue(null);

      await expect(service.updateUser('u1', { name: 'Changed' })).rejects.toEqual(
        expect.objectContaining({ message: 'User not found', statusCode: 404 })
      );
    });

    test('updateUser should reject when a new email is already in use', async () => {
      // Verifies update operations enforce email uniqueness through the repository check.
      const { service, userRepository } = loadUserService();
      userRepository.findById.mockResolvedValue({ _id: 'u1', email: 'old@example.com' });
      userRepository.emailExists.mockResolvedValue(true);

      await expect(service.updateUser('u1', { email: 'dup@example.com' })).rejects.toEqual(
        expect.objectContaining({ message: 'Email already in use', statusCode: 400 })
      );
      expect(userRepository.emailExists).toHaveBeenCalledWith('dup@example.com', 'u1');
    });

    test('deleteUser should reject self-deletion requests', async () => {
      // Verifies admins cannot delete their own account through the service layer.
      const { service, userRepository } = loadUserService();
      userRepository.findById.mockResolvedValue({ _id: 'u1' });

      await expect(service.deleteUser('u1', 'u1')).rejects.toEqual(
        expect.objectContaining({ message: 'You cannot delete your own account', statusCode: 400 })
      );
    });

    test('deleteUser should remove the profile image before deleting the user', async () => {
      // Verifies file cleanup happens before the repository delete call for users with avatars.
      const { service, userRepository, fileHelper } = loadUserService();
      userRepository.findById.mockResolvedValue({ _id: 'u2', profileImage: 'uploads/profiles/a.png' });
      userRepository.deleteById.mockResolvedValue({ _id: 'u2' });

      const result = await service.deleteUser('u2', 'admin');

      expect(fileHelper.deleteFile).toHaveBeenCalledWith('uploads/profiles/a.png');
      expect(userRepository.deleteById).toHaveBeenCalledWith('u2');
      expect(result).toEqual({ _id: 'u2' });
    });

    test('uploadProfileImage should reject when no file is provided', async () => {
      // Verifies image upload requests fail fast when the multipart file is missing.
      const { service } = loadUserService();

      await expect(service.uploadProfileImage('u1', null)).rejects.toEqual(
        expect.objectContaining({ message: 'Please upload a file', statusCode: 400 })
      );
    });

    test('uploadProfileImage should update the stored relative path', async () => {
      // Verifies uploaded files are converted into a relative storage path before persistence.
      const { service, userRepository, fileHelper } = loadUserService();
      userRepository.findById.mockResolvedValue({ _id: 'u1', profileImage: null });
      fileHelper.getRelativeFilePath.mockReturnValue('uploads/profiles/new.png');
      userRepository.updateProfileImage.mockResolvedValue({ _id: 'u1', profileImage: 'uploads/profiles/new.png' });

      const result = await service.uploadProfileImage('u1', { path: '/tmp/uploads/profiles/new.png' });

      expect(fileHelper.getRelativeFilePath).toHaveBeenCalledWith({ path: '/tmp/uploads/profiles/new.png' });
      expect(userRepository.updateProfileImage).toHaveBeenCalledWith('u1', 'uploads/profiles/new.png');
      expect(result.profileImage).toBe('uploads/profiles/new.png');
    });

    test('removeProfileImage should reject when the user has no profile image', async () => {
      // Verifies image removal cannot proceed when there is nothing to remove.
      const { service, userRepository } = loadUserService();
      userRepository.findById.mockResolvedValue({ _id: 'u1', profileImage: null });

      await expect(service.removeProfileImage('u1')).rejects.toEqual(
        expect.objectContaining({ message: 'No profile image to remove', statusCode: 400 })
      );
    });

    test('searchUsers should return repository search results with pagination', async () => {
      // Verifies the search flow uses count and search repository methods consistently.
      const { service, userRepository, paginationHelper } = loadUserService();
      paginationHelper.getPaginationParams.mockReturnValue({ skip: 10, page: 2, pageSize: 10 });
      paginationHelper.getPaginationMetadata.mockReturnValue({ page: 2, pageSize: 10, totalItems: 12, totalPages: 2, hasNext: false, hasPrev: true });
      userRepository.countSearchResults.mockResolvedValue(12);
      userRepository.searchUsers.mockResolvedValue([{ _id: 'u3' }]);

      const result = await service.searchUsers('ram', 2, 10);

      expect(userRepository.countSearchResults).toHaveBeenCalledWith('ram');
      expect(userRepository.searchUsers).toHaveBeenCalledWith('ram', 10, 10);
      expect(result.users).toEqual([{ _id: 'u3' }]);
    });

    test('getUserStatistics should aggregate all repository counters', async () => {
      // Verifies the dashboard statistics response combines multiple repository aggregates.
      const { service, userRepository } = loadUserService();
      userRepository.countUsers.mockResolvedValue(5);
      userRepository.getActiveUsersCount.mockResolvedValue(4);
      userRepository.getInactiveUsersCount.mockResolvedValue(1);
      userRepository.getUserStatsByRole.mockResolvedValue({ admin: 1, employee: 4 });

      const result = await service.getUserStatistics();

      expect(result).toEqual({
        total: 5,
        active: 4,
        inactive: 1,
        byRole: { admin: 1, employee: 4 },
      });
    });

    test('toggleUserStatus should invert the current active state', async () => {
      // Verifies the toggle flow flips the current isActive flag and saves it.
      const { service, userRepository } = loadUserService();
      userRepository.findById.mockResolvedValue({ _id: 'u5', isActive: false });
      userRepository.updateById.mockResolvedValue({ _id: 'u5', isActive: true });

      const result = await service.toggleUserStatus('u5', 'admin');

      expect(userRepository.updateById).toHaveBeenCalledWith('u5', { isActive: true });
      expect(result).toEqual({ _id: 'u5', isActive: true });
    });

    test('updateProfile should persist profile changes when email is available', async () => {
      // Verifies profile updates reuse the repository update flow after uniqueness checks pass.
      const { service, userRepository } = loadUserService();
      userRepository.findById.mockResolvedValue({ _id: 'u3', email: 'old@example.com' });
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.updateById.mockResolvedValue({ _id: 'u3', email: 'new@example.com', name: 'Ram' });

      const result = await service.updateProfile('u3', { email: 'new@example.com', name: 'Ram' });

      expect(userRepository.emailExists).toHaveBeenCalledWith('new@example.com', 'u3');
      expect(userRepository.updateById).toHaveBeenCalledWith('u3', expect.objectContaining({ email: 'new@example.com', name: 'Ram' }));
      expect(result).toEqual({ _id: 'u3', email: 'new@example.com', name: 'Ram' });
    });
  });

  describe('Auth Service', () => {
    test('register should create a user and return auth tokens', async () => {
      // Verifies registration creates a new user and returns token pair payloads.
      const { service, authRepository } = loadAuthService();
      const user = {
        _id: 'u1',
        generateToken: jest.fn().mockReturnValue('access-token'),
        generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      };
      authRepository.checkEmailExists.mockResolvedValue(false);
      authRepository.createUser.mockResolvedValue(user);

      const result = await service.register({
        name: 'Ram',
        email: 'ram@example.com',
        password: 'password123',
      });

      expect(authRepository.checkEmailExists).toHaveBeenCalledWith('ram@example.com');
      expect(authRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'ram@example.com' }));
      expect(result).toEqual({
        user,
        token: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    test('register should reject duplicate email addresses', async () => {
      // Verifies the registration flow blocks duplicate accounts.
      const { service, authRepository } = loadAuthService();
      authRepository.checkEmailExists.mockResolvedValue(true);

      await expect(
        service.register({ name: 'Ram', email: 'ram@example.com', password: 'password123' })
      ).rejects.toEqual(expect.objectContaining({ message: 'Email already registered', statusCode: 409 }));
    });

    test('login should authenticate active users with valid passwords', async () => {
      // Verifies the login flow checks password, updates last login, and returns tokens.
      const { service, authRepository } = loadAuthService();
      const user = {
        _id: 'u1',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        generateToken: jest.fn().mockReturnValue('access-token'),
        generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
        password: 'hashed',
      };
      authRepository.findUserByEmail.mockResolvedValue(user);
      authRepository.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.login({ email: 'ram@example.com', password: 'password123' });

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('ram@example.com');
      expect(user.comparePassword).toHaveBeenCalledWith('password123');
      expect(authRepository.updateLastLogin).toHaveBeenCalledWith('u1');
      expect(result.token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.password).toBeUndefined();
    });

    test('login should reject deactivated accounts', async () => {
      // Verifies inactive users cannot authenticate even with a matching email.
      const { service, authRepository } = loadAuthService();
      authRepository.findUserByEmail.mockResolvedValue({ _id: 'u1', isActive: false });

      await expect(service.login({ email: 'ram@example.com', password: 'password123' })).rejects.toEqual(
        expect.objectContaining({ message: 'Account is deactivated', statusCode: 401 })
      );
    });

    test('login should reject invalid passwords', async () => {
      // Verifies the login flow rejects incorrect passwords after lookup.
      const { service, authRepository } = loadAuthService();
      authRepository.findUserByEmail.mockResolvedValue({
        _id: 'u1',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      });

      await expect(service.login({ email: 'ram@example.com', password: 'wrong' })).rejects.toEqual(
        expect.objectContaining({ message: 'Invalid credentials', statusCode: 401 })
      );
    });

    test('updateProfile should reject an email already used by another user', async () => {
      // Verifies profile updates protect email uniqueness when the email changes.
      const { service, authRepository } = loadAuthService();
      authRepository.findUserById.mockResolvedValue({ _id: 'u1', email: 'old@example.com' });
      authRepository.checkEmailExists.mockResolvedValue(true);

      await expect(service.updateProfile('u1', { email: 'new@example.com' })).rejects.toEqual(
        expect.objectContaining({ message: 'Email already in use', statusCode: 409 })
      );
    });

    test('changePassword should hash and persist the new password', async () => {
      // Verifies successful password changes generate a salt and save the hashed password.
      const { service, authRepository, bcrypt } = loadAuthService();
      authRepository.findUserById.mockResolvedValue({ _id: 'u1', email: 'ram@example.com' });
      authRepository.findUserByEmail.mockResolvedValue({
        _id: 'u1',
        comparePassword: jest.fn().mockResolvedValue(true),
      });
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed-password');
      authRepository.updatePassword.mockResolvedValue(undefined);

      const result = await service.changePassword('u1', {
        currentPassword: 'old-pass',
        newPassword: 'new-pass',
      });

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('new-pass', 'salt');
      expect(authRepository.updatePassword).toHaveBeenCalledWith('u1', 'hashed-password');
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    test('changePassword should reject an incorrect current password', async () => {
      // Verifies password changes fail when the current password check does not pass.
      const { service, authRepository } = loadAuthService();
      authRepository.findUserById.mockResolvedValue({ _id: 'u1', email: 'ram@example.com' });
      authRepository.findUserByEmail.mockResolvedValue({
        _id: 'u1',
        comparePassword: jest.fn().mockResolvedValue(false),
      });

      await expect(
        service.changePassword('u1', { currentPassword: 'wrong', newPassword: 'new-pass' })
      ).rejects.toEqual(expect.objectContaining({ message: 'Current password is incorrect', statusCode: 400 }));
    });

    test('forgotPassword should return a generic message for unknown emails', async () => {
      // Verifies forgot-password does not reveal whether an email exists in the system.
      const { service, authRepository } = loadAuthService();
      authRepository.findUserByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'missing@example.com' });

      expect(result).toEqual({
        message: 'If the email exists, a password reset link has been sent',
      });
    });

    test('forgotPassword should store the reset token and return a dev link in development', async () => {
      // Verifies development forgot-password flow saves the hashed token and returns a frontend link.
      process.env.NODE_ENV = 'development';
      process.env.FRONTEND_URL = 'http://localhost:3000';

      const { service, authRepository, tokenHelper, logger } = loadAuthService();
      authRepository.findUserByEmail.mockResolvedValue({ _id: 'u7', email: 'ram@example.com' });
      tokenHelper.generateResetToken.mockReturnValue({
        resetToken: 'raw-token',
        hashedToken: 'hashed-token',
      });
      authRepository.setResetPasswordToken.mockResolvedValue(undefined);

      const result = await service.forgotPassword({ email: 'ram@example.com' });

      expect(authRepository.setResetPasswordToken).toHaveBeenCalledWith(
        'u7',
        'hashed-token',
        expect.any(Number)
      );
      expect(logger.info).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'If the email exists, a password reset link has been sent',
        devResetLink: 'http://localhost:3000/reset-password/raw-token',
      });
    });

    test('resetPassword should reject invalid reset tokens', async () => {
      // Verifies invalid or expired reset tokens are rejected before any password write occurs.
      const { service, authRepository, tokenHelper } = loadAuthService();
      tokenHelper.hashToken.mockReturnValue('hashed-token');
      authRepository.findUserByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword({ token: 'raw', newPassword: 'new-pass' })).rejects.toEqual(
        expect.objectContaining({ message: 'Invalid or expired reset token', statusCode: 400 })
      );
    });

    test('resetPassword should update the password, clear the token, and issue a login token', async () => {
      // Verifies successful password resets complete all persistence steps and return a login token.
      const { service, authRepository, tokenHelper, bcrypt } = loadAuthService();
      const user = {
        _id: 'u9',
        generateToken: jest.fn().mockReturnValue('login-token'),
      };
      tokenHelper.hashToken.mockReturnValue('hashed-token');
      authRepository.findUserByResetToken.mockResolvedValue(user);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed-password');
      authRepository.updatePassword.mockResolvedValue(undefined);
      authRepository.clearResetPasswordToken.mockResolvedValue(undefined);

      const result = await service.resetPassword({ token: 'raw', newPassword: 'new-pass' });

      expect(authRepository.updatePassword).toHaveBeenCalledWith('u9', 'hashed-password');
      expect(authRepository.clearResetPasswordToken).toHaveBeenCalledWith('u9');
      expect(result).toEqual({
        message: 'Password reset successfully',
        user,
        token: 'login-token',
      });
    });

    test('getUserProfile should return the user when the repository finds one', async () => {
      // Verifies profile lookup succeeds for an existing authenticated user.
      const { service, authRepository } = loadAuthService();
      authRepository.findUserById.mockResolvedValue({ _id: 'u2', email: 'ram@example.com' });

      const result = await service.getUserProfile('u2');

      expect(authRepository.findUserById).toHaveBeenCalledWith('u2');
      expect(result).toEqual({ _id: 'u2', email: 'ram@example.com' });
    });
  });

  describe('Controllers', () => {
    test('userController.createUser should call ApiResponse.success with created status', async () => {
      // Verifies the create-user controller delegates to the service and sends a 201 response.
      const { controller, userService, apiResponse } = loadUserController();
      const req = { body: { name: 'Ram' } };
      const res = createMockRes();
      const next = jest.fn();
      userService.createUser.mockResolvedValue({ _id: 'u1' });

      controller.createUser(req, res, next);
      await flushPromises();

      expect(userService.createUser).toHaveBeenCalledWith({ name: 'Ram' });
      expect(apiResponse.success).toHaveBeenCalledWith(res, { _id: 'u1' }, 'User created successfully', 201);
      expect(next).not.toHaveBeenCalled();
    });

    test('userController.createUser should forward service errors to next', async () => {
      // Verifies controller failures are handed off to Express error middleware.
      const { controller, userService } = loadUserController();
      const next = jest.fn();
      const error = new Error('create failed');
      userService.createUser.mockRejectedValue(error);

      controller.createUser({ body: {} }, createMockRes(), next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(error);
    });

    test('userController.getAllUsers should call ApiResponse.paginated', async () => {
      // Verifies list controller responses are formatted through the paginated helper.
      const { controller, userService, apiResponse } = loadUserController();
      const req = { query: { page: '1' } };
      const res = createMockRes();
      userService.getAllUsers.mockResolvedValue({
        users: [{ _id: 'u1' }],
        pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });

      controller.getAllUsers(req, res, jest.fn());
      await flushPromises();

      expect(apiResponse.paginated).toHaveBeenCalledWith(
        res,
        [{ _id: 'u1' }],
        { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false },
        'Users retrieved successfully'
      );
    });

    test('userController.deleteUser should pass both target and requesting user IDs', async () => {
      // Verifies delete controller forwards both IDs required for self-delete protection.
      const { controller, userService, apiResponse } = loadUserController();
      const req = { params: { id: 'u2' }, user: { _id: { toString: () => 'admin' } } };
      const res = createMockRes();
      userService.deleteUser.mockResolvedValue(undefined);

      controller.deleteUser(req, res, jest.fn());
      await flushPromises();

      expect(userService.deleteUser).toHaveBeenCalledWith('u2', 'admin');
      expect(apiResponse.success).toHaveBeenCalledWith(res, null, 'User deleted successfully');
    });

    test('userController.toggleUserStatus should return a success response', async () => {
      // Verifies the status toggle controller returns the updated user payload.
      const { controller, userService, apiResponse } = loadUserController();
      const req = { params: { id: 'u4' }, user: { _id: { toString: () => 'admin' } } };
      const res = createMockRes();
      userService.toggleUserStatus.mockResolvedValue({ _id: 'u4', isActive: false });

      controller.toggleUserStatus(req, res, jest.fn());
      await flushPromises();

      expect(userService.toggleUserStatus).toHaveBeenCalledWith('u4', 'admin');
      expect(apiResponse.success).toHaveBeenCalledWith(
        res,
        { _id: 'u4', isActive: false },
        'User status updated successfully'
      );
    });

    test('authController.login should return a successful login response', async () => {
      // Verifies login controller passes through the auth service payload unchanged.
      const { controller, authService, apiResponse } = loadAuthController();
      const req = { body: { email: 'ram@example.com', password: 'password123' } };
      const res = createMockRes();
      authService.login.mockResolvedValue({ token: 'access-token' });

      controller.login(req, res, jest.fn());
      await flushPromises();

      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(apiResponse.success).toHaveBeenCalledWith(res, { token: 'access-token' }, 'Login successful');
    });

    test('authController.register should send a 201 created response', async () => {
      // Verifies registration controller uses the created status code on success.
      const { controller, authService, apiResponse } = loadAuthController();
      const req = { body: { email: 'ram@example.com' } };
      const res = createMockRes();
      authService.register.mockResolvedValue({ user: { _id: 'u1' } });

      controller.register(req, res, jest.fn());
      await flushPromises();

      expect(apiResponse.success).toHaveBeenCalledWith(
        res,
        { user: { _id: 'u1' } },
        'User registered successfully',
        201
      );
    });

    test('authController.forgotPassword should return a success response with helper message', async () => {
      // Verifies forgot-password controller wraps the service output in the standard response helper.
      const { controller, authService, apiResponse } = loadAuthController();
      const req = { body: { email: 'ram@example.com' } };
      const res = createMockRes();
      authService.forgotPassword.mockResolvedValue({ message: 'If the email exists, a password reset link has been sent' });

      controller.forgotPassword(req, res, jest.fn());
      await flushPromises();

      expect(apiResponse.success).toHaveBeenCalledWith(
        res,
        { message: 'If the email exists, a password reset link has been sent' },
        'Password reset email sent'
      );
    });

    test('authController.resetPassword should merge route and body token values correctly', async () => {
      // Verifies reset-password controller prefers the URL token while forwarding the request body.
      const { controller, authService, apiResponse } = loadAuthController();
      const req = { params: { token: 'route-token' }, body: { newPassword: 'new-pass' } };
      const res = createMockRes();
      authService.resetPassword.mockResolvedValue({ message: 'Password reset successfully' });

      controller.resetPassword(req, res, jest.fn());
      await flushPromises();

      expect(authService.resetPassword).toHaveBeenCalledWith({
        newPassword: 'new-pass',
        token: 'route-token',
      });
      expect(apiResponse.success).toHaveBeenCalledWith(
        res,
        { message: 'Password reset successfully' },
        'Password reset successfully'
      );
    });

    test('userController.getUserById should return a success response with the user payload', async () => {
      // Verifies the single-user controller wraps a found user in the standard success response.
      const { controller, userService, apiResponse } = loadUserController();
      const req = { params: { id: 'u11' } };
      const res = createMockRes();
      userService.getUserById.mockResolvedValue({ _id: 'u11', name: 'Sita' });

      controller.getUserById(req, res, jest.fn());
      await flushPromises();

      expect(userService.getUserById).toHaveBeenCalledWith('u11');
      expect(apiResponse.success).toHaveBeenCalledWith(res, { _id: 'u11', name: 'Sita' }, 'User retrieved successfully');
    });

    test('authController.getProfile should return the authenticated user profile', async () => {
      // Verifies the auth profile controller fetches the current user and formats the response.
      const { controller, authService, apiResponse } = loadAuthController();
      const req = { user: { _id: 'u12' } };
      const res = createMockRes();
      authService.getUserProfile.mockResolvedValue({ _id: 'u12', email: 'user@example.com' });

      controller.getProfile(req, res, jest.fn());
      await flushPromises();

      expect(authService.getUserProfile).toHaveBeenCalledWith('u12');
      expect(apiResponse.success).toHaveBeenCalledWith(
        res,
        { _id: 'u12', email: 'user@example.com' },
        'Profile retrieved successfully'
      );
    });
  });
});
