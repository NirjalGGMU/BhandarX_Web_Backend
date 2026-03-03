/**
 * Purchase Order DTOs (Data Transfer Objects)
 */

class CreatePurchaseOrderDTO {
  constructor(data = {}) {
    this.supplier = data.supplier;
    this.items = data.items || [];
    this.paidAmount = data.paidAmount || 0;
    this.paymentMethod = data.paymentMethod || 'BANK_TRANSFER';
    this.orderDate = data.orderDate || new Date();
    this.expectedDeliveryDate = data.expectedDeliveryDate;
    this.notes = data.notes;
    this.status = data.status || 'PENDING';
    this.createdBy = data.createdBy;
  }
}

class UpdatePurchaseOrderDTO {
  constructor(data = {}) {
    if (data.supplier !== undefined) this.supplier = data.supplier;
    if (data.items !== undefined) this.items = data.items;
    if (data.paidAmount !== undefined) this.paidAmount = data.paidAmount;
    if (data.paymentMethod !== undefined) this.paymentMethod = data.paymentMethod;
    if (data.orderDate !== undefined) this.orderDate = data.orderDate;
    if (data.expectedDeliveryDate !== undefined) this.expectedDeliveryDate = data.expectedDeliveryDate;
    if (data.actualDeliveryDate !== undefined) this.actualDeliveryDate = data.actualDeliveryDate;
    if (data.notes !== undefined) this.notes = data.notes;
    if (data.status !== undefined) this.status = data.status;
    if (data.updatedBy !== undefined) this.updatedBy = data.updatedBy;
  }
}

class PurchaseOrderFilterDTO {
  constructor(data = {}) {
    this.supplier = data.supplier;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.paymentStatus = data.paymentStatus;
    this.status = data.status;
    this.search = data.search;
    this.page = parseInt(data.page) || 1;
    this.pageSize = parseInt(data.pageSize) || 20;
    this.sortBy = data.sortBy || 'orderDate';
    this.sortOrder = data.sortOrder || 'desc';
  }
}

class ReceiveItemsDTO {
  constructor(data = {}) {
    this.items = data.items || [];
    this.actualDeliveryDate = data.actualDeliveryDate || new Date();
    this.updatedBy = data.updatedBy;
  }
}

module.exports = {
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
  PurchaseOrderFilterDTO,
  ReceiveItemsDTO,
};
