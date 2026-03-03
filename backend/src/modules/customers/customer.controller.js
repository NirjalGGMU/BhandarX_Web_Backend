const customerService = require('./customer.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Customer Controller
 * Handles HTTP requests for customer operations
 */
class CustomerController {
  /**
   * Create a new customer
   * @route POST /api/v1/customers
   */
  createCustomer = catchAsync(async (req, res) => {
    const customer = await customerService.createCustomer(req.body, req.user._id);

    ApiResponse.success(res, customer, 'Customer created successfully', HTTP_STATUS.CREATED);
  });

  /**
   * Get all customers
   * @route GET /api/v1/customers
   */
  getAllCustomers = catchAsync(async (req, res) => {
    const result = await customerService.getAllCustomers(req.query);

    ApiResponse.paginated(
      res,
      result.customers,
      result.pagination,
      'Customers retrieved successfully'
    );
  });

  /**
   * Get customer by ID
   * @route GET /api/v1/customers/:id
   */
  getCustomerById = catchAsync(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);

    ApiResponse.success(res, customer, 'Customer retrieved successfully');
  });

  /**
   * Update customer
   * @route PUT /api/v1/customers/:id
   */
  updateCustomer = catchAsync(async (req, res) => {
    const customer = await customerService.updateCustomer(req.params.id, req.body, req.user._id);

    ApiResponse.success(res, customer, 'Customer updated successfully');
  });

  /**
   * Delete customer
   * @route DELETE /api/v1/customers/:id
   */
  deleteCustomer = catchAsync(async (req, res) => {
    await customerService.deleteCustomer(req.params.id);

    ApiResponse.success(res, null, 'Customer deleted successfully');
  });

  /**
   * Search customers
   * @route GET /api/v1/customers/search
   */
  searchCustomers = catchAsync(async (req, res) => {
    const { q } = req.query;
    const result = await customerService.searchCustomers(q, req.query);

    ApiResponse.paginated(
      res,
      result.customers,
      result.pagination,
      'Search results retrieved successfully'
    );
  });

  /**
   * Get customers by type
   * @route GET /api/v1/customers/type/:type
   */
  getCustomersByType = catchAsync(async (req, res) => {
    const result = await customerService.getCustomersByType(req.params.type, req.query);

    ApiResponse.paginated(
      res,
      result.customers,
      result.pagination,
      'Customers retrieved successfully'
    );
  });

  /**
   * Get customers with outstanding balance
   * @route GET /api/v1/customers/outstanding
   */
  getCustomersWithOutstanding = catchAsync(async (req, res) => {
    const customers = await customerService.getCustomersWithOutstanding();

    ApiResponse.success(res, customers, 'Customers with outstanding balance retrieved successfully');
  });

  /**
   * Get customer statistics
   * @route GET /api/v1/customers/statistics
   */
  getCustomerStats = catchAsync(async (req, res) => {
    const stats = await customerService.getCustomerStats();

    ApiResponse.success(res, stats, 'Customer statistics retrieved successfully');
  });

  /**
   * Toggle customer status
   * @route PATCH /api/v1/customers/:id/toggle-status
   */
  toggleCustomerStatus = catchAsync(async (req, res) => {
    const customer = await customerService.toggleCustomerStatus(req.params.id, req.user._id);

    ApiResponse.success(res, customer, 'Customer status updated successfully');
  });
}

module.exports = new CustomerController();
