const productRepository = require('./product.repository');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const PaginationHelper = require('../../shared/utils/PaginationHelper');
const {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterDTO,
} = require('./product.dto');

class ProductService {
  async createProduct(productData, userId) {
    const createDTO = new CreateProductDTO(productData);

    // Check if SKU already exists
    const skuExists = await productRepository.checkSkuExists(createDTO.sku);
    if (skuExists) {
      throw new AppError('SKU already exists', HTTP_STATUS.CONFLICT);
    }

    // Check if barcode already exists (if provided)
    if (createDTO.barcode) {
      const barcodeExists = await productRepository.checkBarcodeExists(createDTO.barcode);
      if (barcodeExists) {
        throw new AppError('Barcode already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Add user who created the product
    createDTO.createdBy = userId;

    const product = await productRepository.create(createDTO);
    return await productRepository.findById(product._id);
  }

  async getAllProducts(query) {
    const filterDTO = new ProductFilterDTO(query);
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    // Build filter
    const filter = {};

    if (filterDTO.search) {
      filter.$or = [
        { name: { $regex: filterDTO.search, $options: 'i' } },
        { description: { $regex: filterDTO.search, $options: 'i' } },
        { sku: { $regex: filterDTO.search, $options: 'i' } },
      ];
    }

    if (filterDTO.category) {
      filter.category = filterDTO.category;
    }

    if (filterDTO.supplier) {
      filter.supplier = filterDTO.supplier;
    }

    if (filterDTO.status) {
      filter.status = filterDTO.status;
    }

    if (filterDTO.lowStock) {
      filter.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }

    // Build sort
    const sort = {};
    sort[filterDTO.sortBy] = filterDTO.sortOrder === 'asc' ? 1 : -1;

    // Get products and total count
    const [products, totalItems] = await Promise.all([
      productRepository.findAll(filter, { skip, limit: pageSize, sort }),
      productRepository.count(filter),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { products, pagination };
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    return product;
  }

  async getProductBySku(sku) {
    const product = await productRepository.findBySku(sku);

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    return product;
  }

  async updateProduct(id, updateData, userId) {
    const updateDTO = new UpdateProductDTO(updateData);

    // Check if product exists
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if SKU is being changed and if it already exists
    if (updateDTO.sku && updateDTO.sku !== existingProduct.sku) {
      const skuExists = await productRepository.checkSkuExists(updateDTO.sku);
      if (skuExists) {
        throw new AppError('SKU already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Check if barcode is being changed and if it already exists
    if (updateDTO.barcode && updateDTO.barcode !== existingProduct.barcode) {
      const barcodeExists = await productRepository.checkBarcodeExists(updateDTO.barcode);
      if (barcodeExists) {
        throw new AppError('Barcode already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Add user who updated the product
    updateDTO.updatedBy = userId;

    const updatedProduct = await productRepository.update(id, updateDTO);
    return await productRepository.findById(updatedProduct._id);
  }

  async deleteProduct(id) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    await productRepository.delete(id);

    return { message: 'Product deleted successfully' };
  }

  async getLowStockProducts() {
    return await productRepository.findLowStock();
  }

  async getOutOfStockProducts() {
    return await productRepository.findOutOfStock();
  }

  async searchProducts(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new AppError('Search term is required', HTTP_STATUS.BAD_REQUEST);
    }

    return await productRepository.searchProducts(searchTerm);
  }

  async getInventorySummary() {
    const [totalProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
      productRepository.count({ status: 'active' }),
      productRepository.findLowStock(),
      productRepository.findOutOfStock(),
    ]);

    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 10), // Top 10
      outOfStockProducts: outOfStockProducts.slice(0, 10), // Top 10
    };
  }

  async updateProductImages(id, imageUrls, userId) {
    const existingProduct = await this.getProductById(id);

    // Merge new images with existing ones, or replace? 
    // Usually for POS, we might want to replace or append. 
    // Let's append but limit to 5 total images as per multer limit.
    const allImages = [...(existingProduct.images || []), ...imageUrls].slice(-5);

    const updatedProduct = await productRepository.update(id, {
      images: allImages,
      updatedBy: userId
    });

    return await productRepository.findById(updatedProduct._id);
  }
}

module.exports = new ProductService();
