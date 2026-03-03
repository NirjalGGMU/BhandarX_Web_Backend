/**
 * Sales DTOs (Data Transfer Objects)
 */

class CreateSaleDTO {
  constructor(data = {}) {
    this.customer = data.customer;
    this.items = data.items || [];
    this.paidAmount = data.paidAmount || 0;
    this.paymentMethod = data.paymentMethod || 'CASH';
    this.saleDate = data.saleDate || new Date();
    this.dueDate = data.dueDate;
    this.notes = data.notes;
    this.status = data.status || 'COMPLETED';
    this.createdBy = data.createdBy;
  }
}

class UpdateSaleDTO {
  constructor(data = {}) {
    if (data.customer !== undefined) this.customer = data.customer;
    if (data.items !== undefined) this.items = data.items;
    if (data.paidAmount !== undefined) this.paidAmount = data.paidAmount;
    if (data.paymentMethod !== undefined) this.paymentMethod = data.paymentMethod;
    if (data.saleDate !== undefined) this.saleDate = data.saleDate;
    if (data.dueDate !== undefined) this.dueDate = data.dueDate;
    if (data.notes !== undefined) this.notes = data.notes;
    if (data.status !== undefined) this.status = data.status;
    if (data.updatedBy !== undefined) this.updatedBy = data.updatedBy;
  }
}

class SaleFilterDTO {
  constructor(data = {}) {
    this.customer = data.customer;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.paymentStatus = data.paymentStatus;
    this.paymentMethod = data.paymentMethod;
    this.status = data.status;
    this.search = data.search;
    this.page = parseInt(data.page) || 1;
    this.pageSize = parseInt(data.pageSize) || 20;
    this.sortBy = data.sortBy || 'saleDate';
    this.sortOrder = data.sortOrder || 'desc';
  }
}

class ReverseSaleDTO {
  constructor(data = {}) {
    this.reversalReason = data.reversalReason;
    this.reversedBy = data.reversedBy;
  }
}

module.exports = {
  CreateSaleDTO,
  UpdateSaleDTO,
  SaleFilterDTO,
  ReverseSaleDTO,
};
