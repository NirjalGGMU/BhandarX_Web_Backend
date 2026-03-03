const Product = require('./Product.model');

class ProductRepository {
  async create(productData) {
    return await Product.create(productData);
  }

  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    
    const query = Product.find(filter)
      .populate('category', 'name')
      .populate('supplier', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return await query;
  }

  async findById(id) {
    return await Product.findById(id)
      .populate('category', 'name description')
      .populate('supplier', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
  }

  async findBySku(sku) {
    return await Product.findOne({ sku: sku.toUpperCase() });
  }

  async findByBarcode(barcode) {
    return await Product.findOne({ barcode });
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await Product.countDocuments(filter);
  }

  async updateQuantity(id, quantity) {
    return await Product.findByIdAndUpdate(
      id,
      { quantity },
      { new: true, runValidators: true }
    );
  }

  async incrementQuantity(id, amount) {
    return await Product.findByIdAndUpdate(
      id,
      { $inc: { quantity: amount } },
      { new: true }
    );
  }

  async findLowStock() {
    return await Product.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      status: 'active',
    })
      .populate('category', 'name')
      .populate('supplier', 'name email phone')
      .sort({ quantity: 1 });
  }

  async findOutOfStock() {
    return await Product.find({
      quantity: 0,
      status: 'active',
    })
      .populate('category', 'name')
      .populate('supplier', 'name email phone');
  }

  async searchProducts(searchTerm) {
    return await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
        { barcode: { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .populate('category', 'name')
      .populate('supplier', 'name')
      .limit(20);
  }

  async checkSkuExists(sku) {
    const product = await Product.findOne({ sku: sku.toUpperCase() });
    return !!product;
  }

  async checkBarcodeExists(barcode) {
    const product = await Product.findOne({ barcode });
    return !!product;
  }
}

module.exports = new ProductRepository();
