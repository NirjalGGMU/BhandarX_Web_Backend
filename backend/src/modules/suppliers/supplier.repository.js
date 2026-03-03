const Supplier = require('./Supplier.model');

class SupplierRepository {
  async create(supplierData) {
    return await Supplier.create(supplierData);
  }

  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { name: 1 } } = options;

    return await Supplier.find(filter)
      .populate('createdBy', 'name email')
      .populate('productCount')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async findById(id) {
    return await Supplier.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('productCount');
  }

  async findByCode(code) {
    return await Supplier.findOne({ code: code.toUpperCase() });
  }

  async findByEmail(email) {
    return await Supplier.findOne({ email: email.toLowerCase() });
  }

  async update(id, updateData) {
    return await Supplier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Supplier.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await Supplier.countDocuments(filter);
  }

  async searchSuppliers(searchTerm) {
    return await Supplier.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .populate('productCount')
      .limit(20);
  }

  async checkCodeExists(code) {
    const supplier = await Supplier.findOne({ code: code.toUpperCase() });
    return !!supplier;
  }

  async checkEmailExists(email) {
    const supplier = await Supplier.findOne({ email: email.toLowerCase() });
    return !!supplier;
  }

  async checkTaxIdExists(taxId) {
    const supplier = await Supplier.findOne({ taxId });
    return !!supplier;
  }
}

module.exports = new SupplierRepository();
