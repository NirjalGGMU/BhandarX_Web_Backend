/**
 * Data Transfer Objects for Product Variants
 */

class CreateVariantDTO {
  constructor(data) {
    this.product = data.product;
    this.variantName = data.variantName;
    this.sku = data.sku;
    this.barcode = data.barcode;
    this.attributes = data.attributes || {};
    this.purchasePrice = data.purchasePrice;
    this.sellingPrice = data.sellingPrice;
    this.quantity = data.quantity || 0;
    this.minStockLevel = data.minStockLevel || 10;
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.images = data.images || [];
    this.expiryDate = data.expiryDate;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdBy = data.createdBy;
  }
}

class UpdateVariantDTO {
  constructor(data) {
    if (data.variantName !== undefined) this.variantName = data.variantName;
    if (data.sku !== undefined) this.sku = data.sku;
    if (data.barcode !== undefined) this.barcode = data.barcode;
    if (data.attributes !== undefined) this.attributes = data.attributes;
    if (data.purchasePrice !== undefined) this.purchasePrice = data.purchasePrice;
    if (data.sellingPrice !== undefined) this.sellingPrice = data.sellingPrice;
    if (data.quantity !== undefined) this.quantity = data.quantity;
    if (data.minStockLevel !== undefined) this.minStockLevel = data.minStockLevel;
    if (data.weight !== undefined) this.weight = data.weight;
    if (data.dimensions !== undefined) this.dimensions = data.dimensions;
    if (data.images !== undefined) this.images = data.images;
    if (data.expiryDate !== undefined) this.expiryDate = data.expiryDate;
    if (data.isActive !== undefined) this.isActive = data.isActive;
    if (data.updatedBy !== undefined) this.updatedBy = data.updatedBy;
  }
}

class VariantFilterDTO {
  constructor(data) {
    this.product = data.product;
    this.search = data.search;
    this.isActive = data.isActive;
    this.lowStock = data.lowStock === 'true' || data.lowStock === true;
    this.page = parseInt(data.page) || 1;
    this.pageSize = parseInt(data.pageSize) || 10;
    this.sortBy = data.sortBy || 'createdAt';
    this.sortOrder = data.sortOrder || 'desc';
  }
}

module.exports = {
  CreateVariantDTO,
  UpdateVariantDTO,
  VariantFilterDTO,
};
