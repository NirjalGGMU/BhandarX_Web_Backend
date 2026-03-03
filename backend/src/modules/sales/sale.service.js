const saleRepository = require('./sale.repository');
const customerRepository = require('../customers/customer.repository');
const productRepository = require('../products/product.repository');
const variantRepository = require('../products/variant.repository');
const { CreateSaleDTO, UpdateSaleDTO, SaleFilterDTO, ReverseSaleDTO } = require('./sale.dto');
const AppError = require('../../shared/utils/AppError');
const { HTTP_STATUS } = require('../../shared/constants');
const Sale = require('./Sale.model');

/**
 * Sale Service
 * Business logic for sales operations
 */
class SaleService {
  /**
   * Create a new sale with stock deduction
   */
  async createSale(saleData) {
    const dto = new CreateSaleDTO(saleData);

    // Validate customer exists
    if (dto.customer) {
      const customer = await customerRepository.findById(dto.customer);
      if (!customer) {
        throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
      }
    }

    // Validate items and check stock availability
    if (!dto.items || dto.items.length === 0) {
      throw new AppError('Sale must have at least one item', HTTP_STATUS.BAD_REQUEST);
    }

    // Check stock for each item
    for (const item of dto.items) {
      if (item.product) {
        const product = await productRepository.findById(item.product);
        if (!product) {
          throw new AppError(`Product ${item.productName || item.product} not found`, HTTP_STATUS.NOT_FOUND);
        }

        if (product.trackInventory && product.quantity < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${product.name}. Available: ${product.quantity}, Required: ${item.quantity}`,
            HTTP_STATUS.BAD_REQUEST
          );
        }

        // Set product details if not provided
        if (!item.productName) item.productName = product.name;
        if (!item.sku) item.sku = product.sku;
      } else if (item.variant) {
        // Check variant stock (assuming variant repository exists)
        const variant = await variantRepository.findById(item.variant);
        if (!variant) {
          throw new AppError(`Variant ${item.variantName || item.variant} not found`, HTTP_STATUS.NOT_FOUND);
        }

        if (variant.quantity < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${variant.variantName}. Available: ${variant.quantity}, Required: ${item.quantity}`,
            HTTP_STATUS.BAD_REQUEST
          );
        }

        // Set variant details
        if (!item.productName) item.productName = variant.variantName;
        if (!item.sku) item.sku = variant.sku;
      } else {
        throw new AppError('Each item must have either product or variant', HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Prepare sale data with required fields (invoiceNumber, lineTotal, totalAmount)
    const invoiceNumber = await Sale.generateInvoiceNumber();

    const itemsWithLineTotal = dto.items.map((item) => {
      const discountAmount = ((item.unitPrice || 0) * (item.quantity || 0) * (item.discount || 0)) / 100;
      const afterDiscount = (item.unitPrice || 0) * (item.quantity || 0) - discountAmount;
      const taxAmount = (afterDiscount * (item.tax || 0)) / 100;
      const lineTotal = afterDiscount + taxAmount;
      return { ...item, discount: item.discount || 0, tax: item.tax || 0, lineTotal };
    });

    const subtotal = itemsWithLineTotal.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0), 0);
    const totalAmount = itemsWithLineTotal.reduce((sum, item) => sum + item.lineTotal, 0);

    const salePayload = {
      ...dto,
      invoiceNumber,
      items: itemsWithLineTotal,
      subtotal,
      totalAmount,
      paidAmount: dto.paidAmount ?? totalAmount,
    };

    const sale = await saleRepository.create(salePayload);

    // Deduct stock for completed sales
    if (sale.status === 'COMPLETED') {
      await this.deductStock(sale.items);
      
      // Update customer outstanding balance if payment is not full
      if (sale.customer && sale.balanceAmount > 0) {
        await customerRepository.updateBalance(sale.customer, sale.balanceAmount);
      }
    }

    return await saleRepository.findById(sale._id);
  }

  /**
   * Deduct stock for sale items
   */
  async deductStock(items) {
    for (const item of items) {
      if (item.product) {
        await productRepository.incrementQuantity(item.product, -item.quantity);
      } else if (item.variant) {
        await variantRepository.incrementQuantity(item.variant, -item.quantity);
      }
    }
  }

  /**
   * Restore stock for reversed/cancelled sales
   */
  async restoreStock(items) {
    for (const item of items) {
      if (item.product) {
        await productRepository.incrementQuantity(item.product, item.quantity);
      } else if (item.variant) {
        await variantRepository.incrementQuantity(item.variant, item.quantity);
      }
    }
  }

  /**
   * Get all sales with filters
   */
  async getAllSales(filterData) {
    const filter = new SaleFilterDTO(filterData);
    
    const query = {};

    if (filter.customer) {
      query.customer = filter.customer;
    }

    if (filter.startDate || filter.endDate) {
      query.saleDate = {};
      if (filter.startDate) query.saleDate.$gte = new Date(filter.startDate);
      if (filter.endDate) query.saleDate.$lte = new Date(filter.endDate);
    }

    if (filter.paymentStatus) {
      query.paymentStatus = filter.paymentStatus;
    }

    if (filter.paymentMethod) {
      query.paymentMethod = filter.paymentMethod;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      query.invoiceNumber = new RegExp(filter.search, 'i');
    }

    const options = {
      skip: (filter.page - 1) * filter.pageSize,
      limit: filter.pageSize,
      sort: { [filter.sortBy]: filter.sortOrder === 'asc' ? 1 : -1 },
    };

    const [sales, total] = await Promise.all([
      saleRepository.findAll(query, options),
      saleRepository.count(query),
    ]);

    return {
      sales,
      total,
      page: filter.page,
      pageSize: filter.pageSize,
      totalPages: Math.ceil(total / filter.pageSize),
    };
  }

  /**
   * Get sale by ID
   */
  async getSaleById(id) {
    const sale = await saleRepository.findById(id);
    if (!sale) {
      throw new AppError('Sale not found', HTTP_STATUS.NOT_FOUND);
    }
    return sale;
  }

  /**
   * Get sale by invoice number
   */
  async getSaleByInvoiceNumber(invoiceNumber) {
    const sale = await saleRepository.findByInvoiceNumber(invoiceNumber);
    if (!sale) {
      throw new AppError('Sale not found', HTTP_STATUS.NOT_FOUND);
    }
    return sale;
  }

  /**
   * Update sale payment
   */
  async updatePayment(id, paymentData) {
    const sale = await this.getSaleById(id);

    if (sale.status === 'REVERSED' || sale.status === 'CANCELLED') {
      throw new AppError('Cannot update payment for reversed or cancelled sale', HTTP_STATUS.BAD_REQUEST);
    }

    const oldBalance = sale.balanceAmount;
    const updatedSale = await saleRepository.updateById(id, {
      paidAmount: paymentData.paidAmount,
      paymentMethod: paymentData.paymentMethod,
      updatedBy: paymentData.updatedBy,
    });

    // Update customer outstanding balance if customer exists
    if (updatedSale.customer && oldBalance !== updatedSale.balanceAmount) {
      const balanceDiff = updatedSale.balanceAmount - oldBalance;
      await customerRepository.updateBalance(updatedSale.customer._id, balanceDiff);
    }

    return await saleRepository.findById(id);
  }

  /**
   * Reverse a completed sale
   */
  async reverseSale(id, reversalData) {
    const dto = new ReverseSaleDTO(reversalData);
    const sale = await this.getSaleById(id);

    if (sale.status !== 'COMPLETED') {
      throw new AppError('Only completed sales can be reversed', HTTP_STATUS.BAD_REQUEST);
    }

    if (!dto.reversalReason) {
      throw new AppError('Reversal reason is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Update sale status to REVERSED
    const updatedSale = await saleRepository.updateById(id, {
      status: 'REVERSED',
      reversedAt: new Date(),
      reversedBy: dto.reversedBy,
      reversalReason: dto.reversalReason,
    });

    // Restore stock
    await this.restoreStock(sale.items);

    // Update customer outstanding balance if exists
    if (sale.customer && sale.balanceAmount > 0) {
      await customerRepository.updateBalance(sale.customer._id, -sale.balanceAmount);
    }

    return await saleRepository.findById(id);
  }

  /**
   * Cancel a draft sale
   */
  async cancelSale(id, userId) {
    const sale = await this.getSaleById(id);

    if (sale.status !== 'DRAFT') {
      throw new AppError('Only draft sales can be cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    return await saleRepository.updateById(id, {
      status: 'CANCELLED',
      updatedBy: userId,
    });
  }

  /**
   * Get sales by customer
   */
  async getSalesByCustomer(customerId, options = {}) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    const skip = ((options.page || 1) - 1) * (options.pageSize || 20);
    const limit = options.pageSize || 20;

    const [sales, total] = await Promise.all([
      saleRepository.findByCustomer(customerId, { skip, limit }),
      saleRepository.count({ customer: customerId }),
    ]);

    return {
      sales,
      total,
      page: options.page || 1,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get overdue invoices
   */
  async getOverdueSales() {
    return await saleRepository.findOverdue();
  }

  /**
   * Get sales summary
   */
  async getSalesSummary(startDate, endDate) {
    const summary = await saleRepository.getSalesSummary(startDate, endDate);
    return summary.length > 0 ? summary[0] : {
      totalSales: 0,
      totalRevenue: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalPaid: 0,
      totalOutstanding: 0,
    };
  }

  /**
   * Get daily sales report
   */
  async getDailySalesReport(days = 30) {
    return await saleRepository.getDailySalesReport(days);
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(limit = 10, startDate, endDate) {
    return await saleRepository.getTopSellingProducts(limit, startDate, endDate);
  }

  /**
   * Get sales by payment method
   */
  async getSalesByPaymentMethod(startDate, endDate) {
    return await saleRepository.getSalesByPaymentMethod(startDate, endDate);
  }

  /**
   * Get customer purchase history
   */
  async getCustomerPurchaseHistory(customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    const history = await saleRepository.getCustomerPurchaseHistory(customerId);
    return history.length > 0 ? history[0] : {
      totalPurchases: 0,
      totalSpent: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      lastPurchaseDate: null,
    };
  }

  /**
   * Delete a sale (only drafts)
   */
  async deleteSale(id) {
    const sale = await this.getSaleById(id);

    if (sale.status !== 'DRAFT') {
      throw new AppError('Only draft sales can be deleted', HTTP_STATUS.BAD_REQUEST);
    }

    return await saleRepository.deleteById(id);
  }
}

module.exports = new SaleService();
