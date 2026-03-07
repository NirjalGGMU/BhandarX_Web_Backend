const multer = require('multer');
const AppError = require('../utils/AppError');
const fileUploadConfig = require('../../config/fileUpload');
const { storage: cloudinaryStorage } = require('../../config/cloudinary');

const hasCloudinaryCredentials = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

/**
 * Multer storage configuration for profile images
 */
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileUploadConfig.profileImagesDir);
  },
  filename: (req, file, cb) => {
    const fileName = fileUploadConfig.generateFileName(file.originalname);
    cb(null, fileName);
  },
});

/**
 * Multer storage configuration for product images - Now using Cloudinary
 */
const productImageDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileUploadConfig.productImagesDir);
  },
  filename: (req, file, cb) => {
    const fileName = fileUploadConfig.generateFileName(file.originalname);
    cb(null, fileName);
  },
});

const productImageStorage = hasCloudinaryCredentials ? cloudinaryStorage : productImageDiskStorage;

/**
 * Multer storage configuration for documents
 */
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileUploadConfig.documentsDir);
  },
  filename: (req, file, cb) => {
    const fileName = fileUploadConfig.generateFileName(file.originalname);
    cb(null, fileName);
  },
});

/**
 * File filter for images
 */
const imageFileFilter = (req, file, cb) => {
  if (fileUploadConfig.allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Only ${fileUploadConfig.allowedImageTypes.join(', ')} are allowed`,
        400
      ),
      false
    );
  }
};

/**
 * File filter for documents
 */
const documentFileFilter = (req, file, cb) => {
  if (fileUploadConfig.allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Only ${fileUploadConfig.allowedDocumentTypes.join(', ')} are allowed`,
        400
      ),
      false
    );
  }
};

/**
 * Upload middleware for profile images
 */
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: fileUploadConfig.maxFileSize.image,
  },
  fileFilter: imageFileFilter,
}).single('profileImage');

/**
 * Upload middleware for product images
 */
const uploadProductImage = multer({
  storage: productImageStorage,
  limits: {
    fileSize: fileUploadConfig.maxFileSize.image,
  },
  fileFilter: imageFileFilter,
}).single('productImage');

/**
 * Upload middleware for multiple product images
 */
const uploadProductImages = multer({
  storage: productImageStorage,
  limits: {
    fileSize: fileUploadConfig.maxFileSize.image,
  },
  fileFilter: imageFileFilter,
}).array('productImages', 5); // Max 5 images

/**
 * Upload middleware for documents
 */
const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: fileUploadConfig.maxFileSize.document,
  },
  fileFilter: documentFileFilter,
}).single('document');

/**
 * Error handling middleware for multer
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size is too large', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files uploaded', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected field in file upload', 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};

module.exports = {
  uploadProfileImage,
  uploadProductImage,
  uploadProductImages,
  uploadDocument,
  handleMulterError,
};
