class CreateSupplierDTO {
  constructor(data) {
    this.name = data.name;
    this.code = data.code;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.country = data.country;
    this.postalCode = data.postalCode;
    this.contactPerson = data.contactPerson;
    this.taxId = data.taxId;
    this.paymentTerms = data.paymentTerms;
    this.website = data.website;
    this.notes = data.notes;
    this.status = data.status || 'active';
  }
}

class UpdateSupplierDTO {
  constructor(data) {
    this.name = data.name;
    this.code = data.code;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.country = data.country;
    this.postalCode = data.postalCode;
    this.contactPerson = data.contactPerson;
    this.taxId = data.taxId;
    this.paymentTerms = data.paymentTerms;
    this.website = data.website;
    this.notes = data.notes;
    this.status = data.status;
  }
}

module.exports = {
  CreateSupplierDTO,
  UpdateSupplierDTO,
};
