/**
 * Customer DTOs (Data Transfer Objects)
 */

class CreateCustomerDTO {
  constructor(data = {}) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.alternatePhone = data.alternatePhone;
    this.address = data.address;
    this.customerType = data.customerType || 'RETAIL';
    this.taxId = data.taxId;
    this.creditLimit = data.creditLimit || 0;
    this.notes = data.notes;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdBy = data.createdBy;
  }
}

class UpdateCustomerDTO {
  constructor(data = {}) {
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.alternatePhone !== undefined) this.alternatePhone = data.alternatePhone;
    if (data.address !== undefined) this.address = data.address;
    if (data.customerType !== undefined) this.customerType = data.customerType;
    if (data.taxId !== undefined) this.taxId = data.taxId;
    if (data.creditLimit !== undefined) this.creditLimit = data.creditLimit;
    if (data.notes !== undefined) this.notes = data.notes;
    if (data.isActive !== undefined) this.isActive = data.isActive;
    if (data.updatedBy !== undefined) this.updatedBy = data.updatedBy;
  }
}

class CustomerFilterDTO {
  constructor(data = {}) {
    this.search = data.search;
    this.customerType = data.customerType;
    this.isActive = data.isActive;
    this.page = parseInt(data.page) || 1;
    this.pageSize = parseInt(data.pageSize) || 20;
    this.sortBy = data.sortBy || 'createdAt';
    this.sortOrder = data.sortOrder || 'desc';
  }
}

module.exports = {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CustomerFilterDTO,
};
