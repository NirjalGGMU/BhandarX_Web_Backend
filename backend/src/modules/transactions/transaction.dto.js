class CreateTransactionDTO {
  constructor(data) {
    this.product = data.product;
    this.type = data.type;
    this.quantity = data.quantity;
    this.unitPrice = data.unitPrice;
    this.reference = data.reference;
    this.notes = data.notes;
    this.transactionDate = data.transactionDate || new Date();
  }
}

class TransactionFilterDTO {
  constructor(query) {
    this.product = query.product;
    this.type = query.type;
    this.startDate = query.startDate;
    this.endDate = query.endDate;
    this.sortBy = query.sortBy || 'transactionDate';
    this.sortOrder = query.sortOrder || 'desc';
  }
}

module.exports = {
  CreateTransactionDTO,
  TransactionFilterDTO,
};
