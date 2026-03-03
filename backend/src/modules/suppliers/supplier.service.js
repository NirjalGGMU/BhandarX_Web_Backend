const supplierRepository = require('./supplier.repository');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const PaginationHelper = require('../../shared/utils/PaginationHelper');
const {
  CreateSupplierDTO,
  UpdateSupplierDTO,
} = require('./supplier.dto');

class SupplierService {
  async createSupplier(supplierData, userId) {
    const createDTO = new CreateSupplierDTO(supplierData);

    // Check if code already exists
    const codeExists = await supplierRepository.checkCodeExists(createDTO.code);
    if (codeExists) {
      throw new AppError('Supplier code already exists', HTTP_STATUS.CONFLICT);
    }

    // Check if email already exists
    const emailExists = await supplierRepository.checkEmailExists(createDTO.email);
    if (emailExists) {
      throw new AppError('Email already exists', HTTP_STATUS.CONFLICT);
    }

    // Check if tax ID already exists (if provided)
    if (createDTO.taxId) {
      const taxIdExists = await supplierRepository.checkTaxIdExists(createDTO.taxId);
      if (taxIdExists) {
        throw new AppError('Tax ID already exists', HTTP_STATUS.CONFLICT);
      }
    }

    createDTO.createdBy = userId;

    const supplier = await supplierRepository.create(createDTO);
    return await supplierRepository.findById(supplier._id);
  }

  async getAllSuppliers(query) {
    const { page, pageSize, skip } = PaginationHelper.getPaginationParams(query);

    const filter = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { code: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sort = {};
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    sort[sortBy] = sortOrder;

    // Get suppliers and total count
    const [suppliers, totalItems] = await Promise.all([
      supplierRepository.findAll(filter, { skip, limit: pageSize, sort }),
      supplierRepository.count(filter),
    ]);

    const pagination = PaginationHelper.getPaginationMetadata(page, pageSize, totalItems);

    return { suppliers, pagination };
  }

  async getSupplierById(id) {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND);
    }

    return supplier;
  }

  async updateSupplier(id, updateData, userId) {
    const updateDTO = new UpdateSupplierDTO(updateData);

    // Check if supplier exists
    const existingSupplier = await supplierRepository.findById(id);
    if (!existingSupplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if code is being changed and if it already exists
    if (updateDTO.code && updateDTO.code !== existingSupplier.code) {
      const codeExists = await supplierRepository.checkCodeExists(updateDTO.code);
      if (codeExists) {
        throw new AppError('Supplier code already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Check if email is being changed and if it already exists
    if (updateDTO.email && updateDTO.email !== existingSupplier.email) {
      const emailExists = await supplierRepository.checkEmailExists(updateDTO.email);
      if (emailExists) {
        throw new AppError('Email already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Check if tax ID is being changed and if it already exists
    if (updateDTO.taxId && updateDTO.taxId !== existingSupplier.taxId) {
      const taxIdExists = await supplierRepository.checkTaxIdExists(updateDTO.taxId);
      if (taxIdExists) {
        throw new AppError('Tax ID already exists', HTTP_STATUS.CONFLICT);
      }
    }

    updateDTO.updatedBy = userId;

    const updatedSupplier = await supplierRepository.update(id, updateDTO);
    return await supplierRepository.findById(updatedSupplier._id);
  }

  async deleteSupplier(id) {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if supplier has products
    if (supplier.productCount > 0) {
      throw new AppError(
        'Cannot delete supplier with associated products',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await supplierRepository.delete(id);

    return { message: 'Supplier deleted successfully' };
  }

  async searchSuppliers(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new AppError('Search term is required', HTTP_STATUS.BAD_REQUEST);
    }

    return await supplierRepository.searchSuppliers(searchTerm);
  }
}

module.exports = new SupplierService();
