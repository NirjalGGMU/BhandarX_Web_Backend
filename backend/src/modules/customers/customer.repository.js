const Customer = require('./Customer.model');

/**
 * Customer Repository
 * Data access layer for Customer model
 */
class CustomerRepository {
  /**
   * Create a new customer
   */
  async create(customerData) {
    const customer = new Customer(customerData);
    return await customer.save();
  }

  /**
   * Find all customers with filters
   */
  async findAll(filter = {}, options = {}) {
    return await Customer.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(options.sort || { createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Count customers
   */
  async count(filter = {}) {
    return await Customer.countDocuments(filter);
  }

  /**
   * Find customer by ID
   */
  async findById(id) {
    return await Customer.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
  }

  /**
   * Find customer by email
   */
  async findByEmail(email) {
    return await Customer.findOne({ email });
  }

  /**
   * Find customer by phone
   */
  async findByPhone(phone) {
    return await Customer.findOne({ phone });
  }

  /**
   * Update customer by ID
   */
  async updateById(id, updateData) {
    return await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete customer by ID
   */
  async deleteById(id) {
    return await Customer.findByIdAndDelete(id);
  }

  /**
   * Search customers
   */
  async searchCustomers(searchTerm, options = {}) {
    const query = {
      $text: { $search: searchTerm },
    };

    return await Customer.find(query)
      .populate('createdBy', 'name email')
      .sort(options.sort || { score: { $meta: 'textScore' } })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Count search results
   */
  async countSearchResults(searchTerm) {
    const query = {
      $text: { $search: searchTerm },
    };
    return await Customer.countDocuments(query);
  }

  /**
   * Find customers by type
   */
  async findByType(customerType, options = {}) {
    return await Customer.find({ customerType, isActive: true })
      .populate('createdBy', 'name email')
      .sort(options.sort || { name: 1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  /**
   * Check if email exists
   */
  async emailExists(email, excludeId = null) {
    const query = { email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const customer = await Customer.findOne(query);
    return !!customer;
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone, excludeId = null) {
    const query = { phone };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const customer = await Customer.findOne(query);
    return !!customer;
  }

  /**
   * Update customer balance
   */
  async updateBalance(id, amount) {
    return await Customer.findByIdAndUpdate(
      id,
      { $inc: { outstandingBalance: amount } },
      { new: true }
    );
  }

  /**
   * Get customers with outstanding balance
   */
  async findWithOutstandingBalance() {
    return await Customer.find({
      outstandingBalance: { $gt: 0 },
      isActive: true,
    })
      .populate('createdBy', 'name email')
      .sort({ outstandingBalance: -1 });
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats() {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
          totalOutstanding: { $sum: '$outstandingBalance' },
          totalCreditLimit: { $sum: '$creditLimit' },
        },
      },
    ]);

    const typeStats = await Customer.aggregate([
      {
        $group: {
          _id: '$customerType',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      ...stats[0],
      byType: typeStats,
    };
  }
}

module.exports = new CustomerRepository();
