const variantService = require('./variant.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Variant Controller
 * Handles HTTP requests for product variants
 */
class VariantController {
  /**
   * Create a new variant
   * @route POST /api/v1/products/variants
   */
  createVariant = catchAsync(async (req, res) => {
    const variant = await variantService.createVariant(req.body, req.user._id);

    ApiResponse.success(res, variant, 'Variant created successfully', HTTP_STATUS.CREATED);
  });

  /**
   * Get all variants
   * @route GET /api/v1/products/variants
   */
  getAllVariants = catchAsync(async (req, res) => {
    const result = await variantService.getAllVariants(req.query);

    ApiResponse.paginated(res, result.variants, result.pagination, 'Variants retrieved successfully');
  });

  /**
   * Get variant by ID
   * @route GET /api/v1/products/variants/:id
   */
  getVariantById = catchAsync(async (req, res) => {
    const variant = await variantService.getVariantById(req.params.id);

    ApiResponse.success(res, variant, 'Variant retrieved successfully');
  });

  /**
   * Get variant by SKU
   * @route GET /api/v1/products/variants/sku/:sku
   */
  getVariantBySku = catchAsync(async (req, res) => {
    const variant = await variantService.getVariantBySku(req.params.sku);

    ApiResponse.success(res, variant, 'Variant retrieved successfully');
  });

  /**
   * Get variants for a product
   * @route GET /api/v1/products/:productId/variants
   */
  getProductVariants = catchAsync(async (req, res) => {
    const result = await variantService.getProductVariants(req.params.productId, req.query);

    ApiResponse.paginated(res, result.variants, result.pagination, 'Product variants retrieved successfully');
  });

  /**
   * Update variant
   * @route PUT /api/v1/products/variants/:id
   */
  updateVariant = catchAsync(async (req, res) => {
    const variant = await variantService.updateVariant(req.params.id, req.body, req.user._id);

    ApiResponse.success(res, variant, 'Variant updated successfully');
  });

  /**
   * Delete variant
   * @route DELETE /api/v1/products/variants/:id
   */
  deleteVariant = catchAsync(async (req, res) => {
    await variantService.deleteVariant(req.params.id);

    ApiResponse.success(res, null, 'Variant deleted successfully');
  });

  /**
   * Get low stock variants
   * @route GET /api/v1/products/variants/alerts/low-stock
   */
  getLowStockVariants = catchAsync(async (req, res) => {
    const variants = await variantService.getLowStockVariants();

    ApiResponse.success(res, variants, 'Low stock variants retrieved successfully');
  });

  /**
   * Get out of stock variants
   * @route GET /api/v1/products/variants/alerts/out-of-stock
   */
  getOutOfStockVariants = catchAsync(async (req, res) => {
    const variants = await variantService.getOutOfStockVariants();

    ApiResponse.success(res, variants, 'Out of stock variants retrieved successfully');
  });

  /**
   * Get expiring variants
   * @route GET /api/v1/products/variants/alerts/expiring
   */
  getExpiringVariants = catchAsync(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const variants = await variantService.getExpiringVariants(days);

    ApiResponse.success(res, variants, 'Expiring variants retrieved successfully');
  });

  /**
   * Get expired variants
   * @route GET /api/v1/products/variants/alerts/expired
   */
  getExpiredVariants = catchAsync(async (req, res) => {
    const variants = await variantService.getExpiredVariants();

    ApiResponse.success(res, variants, 'Expired variants retrieved successfully');
  });
}

module.exports = new VariantController();
