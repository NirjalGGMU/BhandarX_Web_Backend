const config = require('../../config');

class PaginationHelper {
  static getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const pageSize = Math.min(
      config.pagination.maxPageSize,
      Math.max(1, parseInt(query.pageSize) || parseInt(query.limit) || config.pagination.defaultPageSize)
    );
    const skip = (page - 1) * pageSize;

    return { page, pageSize, skip };
  }

  static getPaginationMetadata(page, pageSize, totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext,
      hasPrev,
    };
  }
}

module.exports = PaginationHelper;
