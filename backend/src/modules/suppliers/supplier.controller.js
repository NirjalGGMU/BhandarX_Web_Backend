const supplierService = require('./supplier.service');
const catchAsync = require('../../shared/utils/catchAsync');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/constants');

class SupplierController {
  createSupplier = catchAsync(async (req, res) => {
    const supplier = await supplierService.createSupplier(req.body, req.user._id);

    ApiResponse.success(
      res,
      supplier,
      'Supplier created successfully',
      HTTP_STATUS.CREATED
    );
  });

  getAllSuppliers = catchAsync(async (req, res) => {
    const result = await supplierService.getAllSuppliers(req.query);

    ApiResponse.paginated(
      res,
      result.suppliers,
      result.pagination,
      'Suppliers retrieved successfully'
    );
  });

  getSupplierById = catchAsync(async (req, res) => {
    const supplier = await supplierService.getSupplierById(req.params.id);

    ApiResponse.success(res, supplier, 'Supplier retrieved successfully');
  });

  updateSupplier = catchAsync(async (req, res) => {
    const supplier = await supplierService.updateSupplier(
      req.params.id,
      req.body,
      req.user._id
    );

    ApiResponse.success(res, supplier, 'Supplier updated successfully');
  });

  deleteSupplier = catchAsync(async (req, res) => {
    const result = await supplierService.deleteSupplier(req.params.id);

    ApiResponse.success(res, result, 'Supplier deleted successfully');
  });

  searchSuppliers = catchAsync(async (req, res) => {
    const suppliers = await supplierService.searchSuppliers(req.query.q);

    ApiResponse.success(res, suppliers, 'Search results retrieved successfully');
  });
}

module.exports = new SupplierController();
