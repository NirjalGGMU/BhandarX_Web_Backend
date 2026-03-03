const categoryRepository = require('./category.repository');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const PaginationHelper = require('../../shared/utils/PaginationHelper');
const {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} = require('./category.dto');

class CategoryService {
  async createCategory(categoryData, userId) {
    const createDTO = new CreateCategoryDTO(categoryData);

    // Check if name already exists
    const nameExists = await categoryRepository.checkNameExists(createDTO.name);
    if (nameExists) {
      throw new AppError('Category name already exists', HTTP_STATUS.CONFLICT);
    }

    // Check if code already exists
    const codeExists = await categoryRepository.checkCodeExists(createDTO.code);
    if (codeExists) {
      throw new AppError('Category code already exists', HTTP_STATUS.CONFLICT);
    }

    // If parent category is provided, verify it exists
    if (createDTO.parentCategory) {
      const parentExists = await categoryRepository.findById(createDTO.parentCategory);
      if (!parentExists) {
        throw new AppError('Parent category not found', HTTP_STATUS.NOT_FOUND);
      }
    }

    createDTO.createdBy = userId;

    const category = await categoryRepository.create(createDTO);
    return await categoryRepository.findById(category._id);
  }

  async getAllCategories(query) {
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    const filter = {};
    
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    if (query.parentCategory) {
      filter.parentCategory = query.parentCategory;
    }

    // Get categories and total count
    const [categories, totalItems] = await Promise.all([
      categoryRepository.findAll(filter, { skip, limit: pageSize }),
      categoryRepository.count(filter),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { categories, pagination };
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  async updateCategory(id, updateData, userId) {
    const updateDTO = new UpdateCategoryDTO(updateData);

    // Check if category exists
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if name is being changed and if it already exists
    if (updateDTO.name && updateDTO.name !== existingCategory.name) {
      const nameExists = await categoryRepository.checkNameExists(updateDTO.name);
      if (nameExists) {
        throw new AppError('Category name already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Check if code is being changed and if it already exists
    if (updateDTO.code && updateDTO.code !== existingCategory.code) {
      const codeExists = await categoryRepository.checkCodeExists(updateDTO.code);
      if (codeExists) {
        throw new AppError('Category code already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // If parent category is being changed, verify it exists
    if (updateDTO.parentCategory) {
      // Prevent setting itself as parent
      if (updateDTO.parentCategory === id) {
        throw new AppError('Category cannot be its own parent', HTTP_STATUS.BAD_REQUEST);
      }

      const parentExists = await categoryRepository.findById(updateDTO.parentCategory);
      if (!parentExists) {
        throw new AppError('Parent category not found', HTTP_STATUS.NOT_FOUND);
      }
    }

    updateDTO.updatedBy = userId;

    const updatedCategory = await categoryRepository.update(id, updateDTO);
    return await categoryRepository.findById(updatedCategory._id);
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if category has products (using virtual productCount)
    if (category.productCount > 0) {
      throw new AppError(
        'Cannot delete category with associated products',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if category has subcategories
    const subcategories = await categoryRepository.findSubcategories(id);
    if (subcategories.length > 0) {
      throw new AppError(
        'Cannot delete category with subcategories',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await categoryRepository.delete(id);

    return { message: 'Category deleted successfully' };
  }

  async getSubcategories(parentId) {
    // Verify parent category exists
    const parentExists = await categoryRepository.findById(parentId);
    if (!parentExists) {
      throw new AppError('Parent category not found', HTTP_STATUS.NOT_FOUND);
    }

    return await categoryRepository.findSubcategories(parentId);
  }

  async getRootCategories() {
    return await categoryRepository.findRootCategories();
  }
}

module.exports = new CategoryService();
