const productService = require('./product.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

class ProductController {
  createProduct = catchAsync(async (req, res) => {
    const product = await productService.createProduct(req.body, req.user._id);

    ApiResponse.success(
      res,
      product,
      'Product created successfully',
      HTTP_STATUS.CREATED
    );
  });

  getAllProducts = catchAsync(async (req, res) => {
    const result = await productService.getAllProducts(req.query);

    ApiResponse.paginated(
      res,
      result.products,
      result.pagination,
      'Products retrieved successfully'
    );
  });

  getProductById = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.id);

    ApiResponse.success(res, product, 'Product retrieved successfully');
  });

  getProductBySku = catchAsync(async (req, res) => {
    const product = await productService.getProductBySku(req.params.sku);

    ApiResponse.success(res, product, 'Product retrieved successfully');
  });

  updateProduct = catchAsync(async (req, res) => {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.user._id
    );

    ApiResponse.success(res, product, 'Product updated successfully');
  });

  deleteProduct = catchAsync(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id);

    ApiResponse.success(res, result, 'Product deleted successfully');
  });

  getLowStockProducts = catchAsync(async (req, res) => {
    const products = await productService.getLowStockProducts();

    ApiResponse.success(res, products, 'Low stock products retrieved successfully');
  });

  getOutOfStockProducts = catchAsync(async (req, res) => {
    const products = await productService.getOutOfStockProducts();

    ApiResponse.success(res, products, 'Out of stock products retrieved successfully');
  });

  searchProducts = catchAsync(async (req, res) => {
    const products = await productService.searchProducts(req.query.q);

    ApiResponse.success(res, products, 'Search results retrieved successfully');
  });

  getInventorySummary = catchAsync(async (req, res) => {
    const summary = await productService.getInventorySummary();

    ApiResponse.success(res, summary, 'Inventory summary retrieved successfully');
  });

  uploadProductImages = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError('Please upload at least one image', HTTP_STATUS.BAD_REQUEST);
    }

    const imageUrls = req.files.map(file => file.path);

    const product = await productService.updateProductImages(
      req.params.id,
      imageUrls,
      req.user._id
    );

    ApiResponse.success(res, product, 'Product images uploaded successfully');
  });
}

module.exports = new ProductController();
