const variantRepository = require('./variant.repository');
const productRepository = require('./product.repository');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const PaginationHelper = require('../../shared/utils/PaginationHelper');
const {
  CreateVariantDTO,
  UpdateVariantDTO,
  VariantFilterDTO,
} = require('./variant.dto');

/**
 * Variant Service
 * Business logic for product variants
 */
class VariantService {
  /**
   * Create a new variant
   */
  async createVariant(variantData, userId) {
    const createDTO = new CreateVariantDTO(variantData);

    // Verify parent product exists
    const product = await productRepository.findById(createDTO.product);
    if (!product) {
      throw new AppError('Parent product not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if SKU already exists
    const skuExists = await variantRepository.checkSkuExists(createDTO.sku);
    if (skuExists) {
      throw new AppError('Variant SKU already exists', HTTP_STATUS.CONFLICT);
    }

    // Check if barcode already exists (if provided)
    if (createDTO.barcode) {
      const barcodeExists = await variantRepository.checkBarcodeExists(createDTO.barcode);
      if (barcodeExists) {
        throw new AppError('Variant barcode already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Add user who created the variant
    createDTO.createdBy = userId;

    const variant = await variantRepository.create(createDTO);
    return await variantRepository.findById(variant._id);
  }

  /**
   * Get all variants with filters
   */
  async getAllVariants(query) {
    const filterDTO = new VariantFilterDTO(query);
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    // Build filter
    const filter = {};

    if (filterDTO.product) {
      filter.product = filterDTO.product;
    }

    if (filterDTO.search) {
      filter.$or = [
        { variantName: { $regex: filterDTO.search, $options: 'i' } },
        { sku: { $regex: filterDTO.search, $options: 'i' } },
      ];
    }

    if (filterDTO.isActive !== undefined) {
      filter.isActive = filterDTO.isActive;
    }

    if (filterDTO.lowStock) {
      filter.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }

    // Build sort
    const sort = {};
    sort[filterDTO.sortBy] = filterDTO.sortOrder === 'asc' ? 1 : -1;

    // Get variants and total count
    const [variants, totalItems] = await Promise.all([
      variantRepository.findAll(filter, { skip, limit: pageSize, sort }),
      variantRepository.count(filter),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { variants, pagination };
  }

  /**
   * Get variant by ID
   */
  async getVariantById(id) {
    const variant = await variantRepository.findById(id);

    if (!variant) {
      throw new AppError('Variant not found', HTTP_STATUS.NOT_FOUND);
    }

    return variant;
  }

  /**
   * Get variant by SKU
   */
  async getVariantBySku(sku) {
    const variant = await variantRepository.findBySku(sku);

    if (!variant) {
      throw new AppError('Variant not found', HTTP_STATUS.NOT_FOUND);
    }

    return variant;
  }

  /**
   * Get variants for a specific product
   */
  async getProductVariants(productId, query) {
    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);
    const sort = { createdAt: -1 };

    // Get variants and total count
    const [variants, totalItems] = await Promise.all([
      variantRepository.findByProduct(productId, { skip, limit: pageSize, sort }),
      variantRepository.count({ product: productId }),
    ]);

    // Get total quantity across all variants
    const totalQuantity = await variantRepository.getTotalProductQuantity(productId);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return {
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
      },
      variants,
      totalQuantity,
      pagination,
    };
  }

  /**
   * Update variant
   */
  async updateVariant(id, updateData, userId) {
    const updateDTO = new UpdateVariantDTO(updateData);

    // Check if variant exists
    const existingVariant = await variantRepository.findById(id);
    if (!existingVariant) {
      throw new AppError('Variant not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if SKU is being changed and if it already exists
    if (updateDTO.sku && updateDTO.sku !== existingVariant.sku) {
      const skuExists = await variantRepository.checkSkuExists(updateDTO.sku, id);
      if (skuExists) {
        throw new AppError('Variant SKU already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Check if barcode is being changed and if it already exists
    if (updateDTO.barcode && updateDTO.barcode !== existingVariant.barcode) {
      const barcodeExists = await variantRepository.checkBarcodeExists(updateDTO.barcode, id);
      if (barcodeExists) {
        throw new AppError('Variant barcode already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Add user who updated the variant
    updateDTO.updatedBy = userId;

    const updatedVariant = await variantRepository.update(id, updateDTO);
    return await variantRepository.findById(updatedVariant._id);
  }

  /**
   * Delete variant
   */
  async deleteVariant(id) {
    const variant = await variantRepository.findById(id);

    if (!variant) {
      throw new AppError('Variant not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if variant has stock
    if (variant.quantity > 0) {
      throw new AppError(
        'Cannot delete variant with existing stock. Please adjust stock to zero first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await variantRepository.delete(id);

    return { message: 'Variant deleted successfully' };
  }

  /**
   * Get low stock variants
   */
  async getLowStockVariants() {
    return await variantRepository.findLowStock();
  }

  /**
   * Get out of stock variants
   */
  async getOutOfStockVariants() {
    return await variantRepository.findOutOfStock();
  }

  /**
   * Get expiring variants
   */
  async getExpiringVariants(days = 30) {
    return await variantRepository.findExpiringSoon(days);
  }

  /**
   * Get expired variants
   */
  async getExpiredVariants() {
    return await variantRepository.findExpired();
  }

  /**
   * Update variant quantity (for transactions)
   * This should only be called from transaction service
   */
  async updateVariantQuantity(variantId, newQuantity) {
    const variant = await variantRepository.findById(variantId);

    if (!variant) {
      throw new AppError('Variant not found', HTTP_STATUS.NOT_FOUND);
    }

    if (newQuantity < 0) {
      throw new AppError('Quantity cannot be negative', HTTP_STATUS.BAD_REQUEST);
    }

    return await variantRepository.updateQuantity(variantId, newQuantity);
  }
}

module.exports = new VariantService();
