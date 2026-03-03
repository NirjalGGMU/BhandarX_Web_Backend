class CreateProductDTO {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.sku = data.sku;
    this.barcode = data.barcode;
    this.category = data.category;
    this.supplier = data.supplier;
    this.purchasePrice = data.purchasePrice;
    this.sellingPrice = data.sellingPrice;
    this.quantity = data.quantity || 0;
    this.minStockLevel = data.minStockLevel || 10;
    this.maxStockLevel = data.maxStockLevel;
    this.unit = data.unit;
    this.location = data.location;
    this.status = data.status || 'active';
    this.expiryDate = data.expiryDate;
    this.tags = data.tags;
  }
}

class UpdateProductDTO {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.sku = data.sku;
    this.barcode = data.barcode;
    this.category = data.category;
    this.supplier = data.supplier;
    this.purchasePrice = data.purchasePrice;
    this.sellingPrice = data.sellingPrice;
    this.minStockLevel = data.minStockLevel;
    this.maxStockLevel = data.maxStockLevel;
    this.unit = data.unit;
    this.location = data.location;
    this.status = data.status;
    this.expiryDate = data.expiryDate;
    this.tags = data.tags;
  }
}

class ProductFilterDTO {
  constructor(query) {
    this.search = query.search;
    this.category = query.category;
    this.supplier = query.supplier;
    this.status = query.status;
    this.lowStock = query.lowStock === 'true';
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
  }
}

module.exports = {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterDTO,
};
