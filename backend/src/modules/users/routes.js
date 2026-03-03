const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const validate = require('../../shared/middleware/validate');
const { uploadProfileImage, handleMulterError } = require('../../shared/middleware/fileUpload');
const {
  createUserValidation,
  updateUserValidation,
  updateProfileValidation,
  userIdValidation,
  userFilterValidation,
} = require('./user.validator');
const { ROLES } = require('../../shared/constants');

// ============================================
// Public Routes (None for users module)
// ============================================

// ============================================
// Protected Routes (All authenticated users)
// ============================================

// Profile routes - must come before /:id routes
router.get('/profile/me', protect, userController.getMyProfile);
router.put('/profile/me', protect, updateProfileValidation, validate, userController.updateMyProfile);

// Profile image routes
router.post(
  '/profile/image',
  protect,
  uploadProfileImage,
  handleMulterError,
  userController.uploadProfileImage
);
router.delete('/profile/image', protect, userController.removeProfileImage);

// ============================================
// Admin & Manager Routes
// ============================================

// Statistics - Admin only
router.get('/statistics', protect, authorize(ROLES.ADMIN), userController.getUserStatistics);

// Search users - Admin & Manager
router.get('/search', protect, authorize(ROLES.ADMIN), userController.searchUsers);

// Get users by role - Admin & Manager
router.get(
  '/role/:role',
  protect,
  authorize(ROLES.ADMIN),
  userController.getUsersByRole
);

// User CRUD operations
router
  .route('/')
  .get(protect, authorize(ROLES.ADMIN), userFilterValidation, validate, userController.getAllUsers)
  .post(protect, authorize(ROLES.ADMIN), createUserValidation, validate, userController.createUser);

router
  .route('/:id')
  .get(protect, authorize(ROLES.ADMIN), userIdValidation, validate, userController.getUserById)
  .put(protect, authorize(ROLES.ADMIN), updateUserValidation, validate, userController.updateUser)
  .delete(protect, authorize(ROLES.ADMIN), userIdValidation, validate, userController.deleteUser);

// Toggle user status - Admin only
router.patch(
  '/:id/toggle-status',
  protect,
  authorize(ROLES.ADMIN),
  userIdValidation,
  validate,
  userController.toggleUserStatus
);

module.exports = router;
