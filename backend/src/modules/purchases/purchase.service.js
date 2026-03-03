const purchaseRepository = require('./purchase.repository');
const supplierRepository = require('../suppliers/supplier.repository');
const productRepository = require('../products/product.repository');
const { 
  CreatePurchaseOrderDTO, 
  UpdatePurchaseOrderDTO, 
  PurchaseOrderFilterDTO, 
  ReceiveItemsDTO 
} = require('./purchase.dto');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Purchase Order Service
 * Business logic for purchase order operations
 */
class PurchaseOrderService {
  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(poData) {
    const dto = new CreatePurchaseOrderDTO(poData);

    // Validate supplier exists
    const supplier = await supplierRepository.findById(dto.supplier);
    if (!supplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND);
    }

    // Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new AppError('Purchase order must have at least one item', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate products exist
    for (const item of dto.items) {
      const product = await productRepository.findById(item.product);
      if (!product) {
        throw new AppError(`Product ${item.productName || item.product} not found`, HTTP_STATUS.NOT_FOUND);
      }

      // Set product details if not provided
      if (!item.productName) item.productName = product.name;
      if (!item.sku) item.sku = product.sku;
    }

    // Create the purchase order
    const purchaseOrder = await purchaseRepository.create(dto);
    return await purchaseRepository.findById(purchaseOrder._id);
  }

  /**
   * Get all purchase orders with filters
   */
  async getAllPurchaseOrders(filterData) {
    const filter = new PurchaseOrderFilterDTO(filterData);
    
    const query = {};

    if (filter.supplier) {
      query.supplier = filter.supplier;
    }

    if (filter.startDate || filter.endDate) {
      query.orderDate = {};
      if (filter.startDate) query.orderDate.$gte = new Date(filter.startDate);
      if (filter.endDate) query.orderDate.$lte = new Date(filter.endDate);
    }

    if (filter.paymentStatus) {
      query.paymentStatus = filter.paymentStatus;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      query.poNumber = new RegExp(filter.search, 'i');
    }

    const options = {
      skip: (filter.page - 1) * filter.pageSize,
      limit: filter.pageSize,
      sort: { [filter.sortBy]: filter.sortOrder === 'asc' ? 1 : -1 },
    };

    const [purchaseOrders, total] = await Promise.all([
      purchaseRepository.findAll(query, options),
      purchaseRepository.count(query),
    ]);

    return {
      purchaseOrders,
      total,
      page: filter.page,
      pageSize: filter.pageSize,
      totalPages: Math.ceil(total / filter.pageSize),
    };
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(id) {
    const purchaseOrder = await purchaseRepository.findById(id);
    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', HTTP_STATUS.NOT_FOUND);
    }
    return purchaseOrder;
  }

  /**
   * Get purchase order by PO number
   */
  async getPurchaseOrderByPONumber(poNumber) {
    const purchaseOrder = await purchaseRepository.findByPONumber(poNumber);
    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', HTTP_STATUS.NOT_FOUND);
    }
    return purchaseOrder;
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(id, updateData) {
    const purchaseOrder = await this.getPurchaseOrderById(id);

    if (purchaseOrder.status === 'RECEIVED') {
      throw new AppError('Cannot update a fully received purchase order', HTTP_STATUS.BAD_REQUEST);
    }

    if (purchaseOrder.status === 'CANCELLED') {
      throw new AppError('Cannot update a cancelled purchase order', HTTP_STATUS.BAD_REQUEST);
    }

    const dto = new UpdatePurchaseOrderDTO(updateData);
    return await purchaseRepository.updateById(id, dto);
  }

  /**
   * Receive items from purchase order
   */
  async receiveItems(id, receiveData) {
    const dto = new ReceiveItemsDTO(receiveData);
    const purchaseOrder = await this.getPurchaseOrderById(id);

    if (purchaseOrder.status === 'RECEIVED') {
      throw new AppError('Purchase order is already fully received', HTTP_STATUS.BAD_REQUEST);
    }

    if (purchaseOrder.status === 'CANCELLED') {
      throw new AppError('Cannot receive items for a cancelled purchase order', HTTP_STATUS.BAD_REQUEST);
    }

    if (!dto.items || dto.items.length === 0) {
      throw new AppError('No items to receive', HTTP_STATUS.BAD_REQUEST);
    }

    // Update received quantities and add stock
    for (const receiveItem of dto.items) {
      const poItem = purchaseOrder.items.find(
        (item) => item._id.toString() === receiveItem.itemId
      );

      if (!poItem) {
        throw new AppError(`Item ${receiveItem.itemId} not found in purchase order`, HTTP_STATUS.NOT_FOUND);
      }

      const newReceivedQty = (poItem.receivedQuantity || 0) + receiveItem.quantity;

      if (newReceivedQty > poItem.quantity) {
        throw new AppError(
          `Cannot receive more than ordered quantity for ${poItem.productName}. Ordered: ${poItem.quantity}, Already received: ${poItem.receivedQuantity}, Trying to receive: ${receiveItem.quantity}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Update received quantity in the purchase order
      poItem.receivedQuantity = newReceivedQty;

      // Add stock to product
      if (poItem.product) {
        await productRepository.incrementQuantity(poItem.product, receiveItem.quantity);
      }
    }

    // Update purchase order
    purchaseOrder.actualDeliveryDate = dto.actualDeliveryDate;
    purchaseOrder.updatedBy = dto.updatedBy;
    
    // The pre-save middleware will automatically update the status based on received quantities
    await purchaseOrder.save();

    return await purchaseRepository.findById(id);
  }

  /**
   * Update payment
   */
  async updatePayment(id, paymentData) {
    const purchaseOrder = await this.getPurchaseOrderById(id);

    if (purchaseOrder.status === 'CANCELLED') {
      throw new AppError('Cannot update payment for a cancelled purchase order', HTTP_STATUS.BAD_REQUEST);
    }

    return await purchaseRepository.updateById(id, {
      paidAmount: paymentData.paidAmount,
      paymentMethod: paymentData.paymentMethod,
      updatedBy: paymentData.updatedBy,
    });
  }

  /**
   * Cancel a purchase order
   */
  async cancelPurchaseOrder(id, userId) {
    const purchaseOrder = await this.getPurchaseOrderById(id);

    if (purchaseOrder.status === 'RECEIVED') {
      throw new AppError('Cannot cancel a fully received purchase order', HTTP_STATUS.BAD_REQUEST);
    }

    if (purchaseOrder.status === 'PARTIAL_RECEIVED') {
      throw new AppError('Cannot cancel a partially received purchase order', HTTP_STATUS.BAD_REQUEST);
    }

    return await purchaseRepository.updateById(id, {
      status: 'CANCELLED',
      updatedBy: userId,
    });
  }

  /**
   * Get purchase orders by supplier
   */
  async getPurchaseOrdersBySupplier(supplierId, options = {}) {
    const supplier = await supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND);
    }

    const skip = ((options.page || 1) - 1) * (options.pageSize || 20);
    const limit = options.pageSize || 20;

    const [purchaseOrders, total] = await Promise.all([
      purchaseRepository.findBySupplier(supplierId, { skip, limit }),
      purchaseRepository.count({ supplier: supplierId }),
    ]);

    return {
      purchaseOrders,
      total,
      page: options.page || 1,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get pending deliveries
   */
  async getPendingDeliveries() {
    return await purchaseRepository.findPendingDeliveries();
  }

  /**
   * Get overdue deliveries
   */
  async getOverdueDeliveries() {
    return await purchaseRepository.findOverdueDeliveries();
  }

  /**
   * Get purchases summary
   */
  async getPurchasesSummary(startDate, endDate) {
    const summary = await purchaseRepository.getPurchasesSummary(startDate, endDate);
    return summary.length > 0 ? summary[0] : {
      totalPurchases: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
    };
  }

  /**
   * Get supplier purchase history
   */
  async getSupplierPurchaseHistory(supplierId) {
    const supplier = await supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND);
    }

    const history = await purchaseRepository.getSupplierPurchaseHistory(supplierId);
    return history.length > 0 ? history[0] : {
      totalOrders: 0,
      totalSpent: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      lastOrderDate: null,
    };
  }

  /**
   * Get most purchased products
   */
  async getMostPurchasedProducts(limit = 10, startDate, endDate) {
    return await purchaseRepository.getMostPurchasedProducts(limit, startDate, endDate);
  }

  /**
   * Get daily purchase report
   */
  async getDailyPurchaseReport(days = 30) {
    return await purchaseRepository.getDailyPurchaseReport(days);
  }

  /**
   * Delete a purchase order (only drafts)
   */
  async deletePurchaseOrder(id) {
    const purchaseOrder = await this.getPurchaseOrderById(id);

    if (purchaseOrder.status !== 'DRAFT') {
      throw new AppError('Only draft purchase orders can be deleted', HTTP_STATUS.BAD_REQUEST);
    }

    return await purchaseRepository.deleteById(id);
  }
}

module.exports = new PurchaseOrderService();
