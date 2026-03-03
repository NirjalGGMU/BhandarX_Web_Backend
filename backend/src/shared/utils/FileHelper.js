const fs = require('fs').promises;
const path = require('path');
const logger = require('../../config/logger');

/**
 * File Helper Utilities
 */
class FileHelper {
  /**
   * Delete a file
   * @param {string} filePath - Path to the file
   */
  static async deleteFile(filePath) {
    try {
      if (!filePath) return;

      const fullPath = path.join(__dirname, '../../../', filePath);
      await fs.unlink(fullPath);
      logger.info(`File deleted: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error(`Error deleting file: ${error.message}`);
      }
    }
  }

  /**
   * Delete multiple files
   * @param {string[]} filePaths - Array of file paths
   */
  static async deleteFiles(filePaths) {
    if (!Array.isArray(filePaths)) return;

    const deletePromises = filePaths.map((filePath) => this.deleteFile(filePath));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>}
   */
  static async fileExists(filePath) {
    try {
      const fullPath = path.join(__dirname, '../../../', filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file size in bytes
   * @param {string} filePath - Path to the file
   * @returns {Promise<number>}
   */
  static async getFileSize(filePath) {
    try {
      const fullPath = path.join(__dirname, '../../../', filePath);
      const stats = await fs.stat(fullPath);
      return stats.size;
    } catch (error) {
      logger.error(`Error getting file size: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get relative file path for storage
   * @param {Object} file - Multer file object
   * @returns {string}
   */
  static getRelativeFilePath(file) {
    if (!file) return null;

    // Extract relative path from absolute path
    const uploadsIndex = file.path.indexOf('uploads');
    if (uploadsIndex === -1) return null;

    return file.path.substring(uploadsIndex).replace(/\\/g, '/');
  }

  /**
   * Get file URL
   * @param {string} filePath - Relative file path
   * @param {Object} req - Express request object
   * @returns {string}
   */
  static getFileUrl(filePath, req) {
    if (!filePath) return null;

    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/${filePath}`;
  }

  /**
   * Validate file size
   * @param {number} fileSize - File size in bytes
   * @param {number} maxSize - Maximum allowed size in bytes
   * @returns {boolean}
   */
  static validateFileSize(fileSize, maxSize) {
    return fileSize <= maxSize;
  }

  /**
   * Validate file type
   * @param {string} mimeType - File MIME type
   * @param {string[]} allowedTypes - Array of allowed MIME types
   * @returns {boolean}
   */
  static validateFileType(mimeType, allowedTypes) {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string}
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

module.exports = FileHelper;
