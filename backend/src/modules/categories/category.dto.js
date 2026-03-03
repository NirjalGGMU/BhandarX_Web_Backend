class CreateCategoryDTO {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.code = data.code;
    if (data.parentCategory) {
      this.parentCategory = data.parentCategory;
    }
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }
}

class UpdateCategoryDTO {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.code = data.code;
    if (data.parentCategory) {
      this.parentCategory = data.parentCategory;
    }
    this.isActive = data.isActive;
  }
}

module.exports = {
  CreateCategoryDTO,
  UpdateCategoryDTO,
};
