const customerRepository = require('./customer.repository');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const PaginationHelper = require('../../shared/utils/PaginationHelper');
const {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CustomerFilterDTO,
} = require('./customer.dto');

/**
 * Customer Service
 * Business logic for customer operations
 */
class CustomerService {
  /**
   * Create a new customer
   */
  async createCustomer(customerData, userId) {
    const createDTO = new CreateCustomerDTO(customerData);
    createDTO.createdBy = userId;

    // Check if email exists (if provided)
    if (createDTO.email) {
      const emailExists = await customerRepository.emailExists(createDTO.email);
      if (emailExists) {
        throw new AppError('Email already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Check if phone exists
    const phoneExists = await customerRepository.phoneExists(createDTO.phone);
    if (phoneExists) {
      throw new AppError('Phone number already exists', HTTP_STATUS.CONFLICT);
    }

    return await customerRepository.create(createDTO);
  }

  /**
   * Get all customers with filters
   */
  async getAllCustomers(query) {
    const filterDTO = new CustomerFilterDTO(query);
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    // Build filter
    const filter = {};

    if (filterDTO.search) {
      filter.$or = [
        { name: { $regex: filterDTO.search, $options: 'i' } },
        { email: { $regex: filterDTO.search, $options: 'i' } },
        { phone: { $regex: filterDTO.search, $options: 'i' } },
      ];
    }

    if (filterDTO.customerType) {
      filter.customerType = filterDTO.customerType;
    }

    if (filterDTO.isActive !== undefined) {
      filter.isActive = filterDTO.isActive;
    }

    // Build sort
    const sort = {};
    sort[filterDTO.sortBy] = filterDTO.sortOrder === 'asc' ? 1 : -1;

    // Get customers and total count
    const [customers, totalItems] = await Promise.all([
      customerRepository.findAll(filter, { skip, limit: pageSize, sort }),
      customerRepository.count(filter),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { customers, pagination };
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    return customer;
  }

  /**
   * Update customer
   */
  async updateCustomer(id, updateData, userId) {
    const updateDTO = new UpdateCustomerDTO(updateData);
    updateDTO.updatedBy = userId;

    // Check if customer exists
    const existingCustomer = await customerRepository.findById(id);
    if (!existingCustomer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if email is being changed and if it already exists
    if (updateDTO.email && updateDTO.email !== existingCustomer.email) {
      const emailExists = await customerRepository.emailExists(updateDTO.email, id);
      if (emailExists) {
        throw new AppError('Email already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Check if phone is being changed and if it already exists
    if (updateDTO.phone && updateDTO.phone !== existingCustomer.phone) {
      const phoneExists = await customerRepository.phoneExists(updateDTO.phone, id);
      if (phoneExists) {
        throw new AppError('Phone number already exists', HTTP_STATUS.CONFLICT);
      }
    }

    return await customerRepository.updateById(id, updateDTO);
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if customer has outstanding balance
    if (customer.outstandingBalance > 0) {
      throw new AppError(
        'Cannot delete customer with outstanding balance. Please clear the balance first.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await customerRepository.deleteById(id);

    return { message: 'Customer deleted successfully' };
  }

  /**
   * Search customers
   */
  async searchCustomers(searchTerm, query) {
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    const [customers, totalItems] = await Promise.all([
      customerRepository.searchCustomers(searchTerm, { skip, limit: pageSize }),
      customerRepository.countSearchResults(searchTerm),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { customers, pagination };
  }

  /**
   * Get customers by type
   */
  async getCustomersByType(customerType, query) {
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    const [customers, totalItems] = await Promise.all([
      customerRepository.findByType(customerType, { skip, limit: pageSize }),
      customerRepository.count({ customerType, isActive: true }),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { customers, pagination };
  }

  /**
   * Get customers with outstanding balance
   */
  async getCustomersWithOutstanding() {
    return await customerRepository.findWithOutstandingBalance();
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats() {
    return await customerRepository.getCustomerStats();
  }

  /**
   * Toggle customer status
   */
  async toggleCustomerStatus(id, userId) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    const updateData = {
      isActive: !customer.isActive,
      updatedBy: userId,
    };

    return await customerRepository.updateById(id, updateData);
  }
}

module.exports = new CustomerService();
