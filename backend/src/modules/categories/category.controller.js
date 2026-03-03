const categoryService = require('./category.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

class CategoryController {
  createCategory = catchAsync(async (req, res) => {
    const category = await categoryService.createCategory(req.body, req.user._id);

    ApiResponse.success(
      res,
      category,
      'Category created successfully',
      HTTP_STATUS.CREATED
    );
  });

  getAllCategories = catchAsync(async (req, res) => {
    const result = await categoryService.getAllCategories(req.query);

    ApiResponse.paginated(
      res,
      result.categories,
      result.pagination,
      'Categories retrieved successfully'
    );
  });

  getCategoryById = catchAsync(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);

    ApiResponse.success(res, category, 'Category retrieved successfully');
  });

  updateCategory = catchAsync(async (req, res) => {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
      req.user._id
    );

    ApiResponse.success(res, category, 'Category updated successfully');
  });

  deleteCategory = catchAsync(async (req, res) => {
    const result = await categoryService.deleteCategory(req.params.id);

    ApiResponse.success(res, result, 'Category deleted successfully');
  });

  getSubcategories = catchAsync(async (req, res) => {
    const subcategories = await categoryService.getSubcategories(req.params.id);

    ApiResponse.success(res, subcategories, 'Subcategories retrieved successfully');
  });

  getRootCategories = catchAsync(async (req, res) => {
    const categories = await categoryService.getRootCategories();

    ApiResponse.success(res, categories, 'Root categories retrieved successfully');
  });
}

module.exports = new CategoryController();
