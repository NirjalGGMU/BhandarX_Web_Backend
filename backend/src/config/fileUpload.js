const path = require('path');
const fs = require('fs');
const logger = require('./logger');

/**
 * File Upload Configuration
 */
const fileUploadConfig = {
  // Upload directories
  uploadDir: path.join(__dirname, '../../uploads'),
  profileImagesDir: path.join(__dirname, '../../uploads/profiles'),
  productImagesDir: path.join(__dirname, '../../uploads/products'),
  documentsDir: path.join(__dirname, '../../uploads/documents'),

  // File size limits (in bytes)
  maxFileSize: {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
  },

  // Allowed file types
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  // File name generation
  generateFileName: (originalName) => {
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${nameWithoutExt}-${timestamp}-${randomString}${ext}`;
  },
};

/**
 * Create upload directories if they don't exist
 */
const createUploadDirectories = () => {
  const directories = [
    fileUploadConfig.uploadDir,
    fileUploadConfig.profileImagesDir,
    fileUploadConfig.productImagesDir,
    fileUploadConfig.documentsDir,
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created upload directory: ${dir}`);
    }
  });
};

// Create directories on module load
createUploadDirectories();

module.exports = fileUploadConfig;
