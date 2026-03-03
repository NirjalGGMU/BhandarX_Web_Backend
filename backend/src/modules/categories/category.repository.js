const Category = require('./Category.model');

class CategoryRepository {
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 100, sort = { name: 1 } } = options;

    return await Category.find(filter)
      .populate('parentCategory', 'name code')
      .populate('createdBy', 'name email')
      .populate('productCount')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async findById(id) {
    return await Category.findById(id)
      .populate('parentCategory', 'name code description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('productCount');
  }

  async findByName(name) {
    return await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
  }

  async findByCode(code) {
    return await Category.findOne({ code: code.toUpperCase() });
  }

  async update(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await Category.countDocuments(filter);
  }

  async findSubcategories(parentId) {
    return await Category.find({ parentCategory: parentId })
      .populate('productCount')
      .sort({ name: 1 });
  }

  async findRootCategories() {
    return await Category.find({ parentCategory: null, isActive: true })
      .populate('productCount')
      .sort({ name: 1 });
  }

  async checkNameExists(name) {
    const category = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    return !!category;
  }

  async checkCodeExists(code) {
    const category = await Category.findOne({ code: code.toUpperCase() });
    return !!category;
  }
}

module.exports = new CategoryRepository();
