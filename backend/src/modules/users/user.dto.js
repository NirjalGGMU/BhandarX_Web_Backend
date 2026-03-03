/**
 * Data Transfer Objects for Users Module
 */

class CreateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.phone = data.phone;
    this.profileImage = data.profileImage;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }
}

class UpdateUserDTO {
  constructor(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.role !== undefined) this.role = data.role;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.profileImage !== undefined) this.profileImage = data.profileImage;
    if (data.isActive !== undefined) this.isActive = data.isActive;
  }
}

class UpdateProfileDTO {
  constructor(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
    if (data.profileImage !== undefined) this.profileImage = data.profileImage;
    if (data.notificationPreferences !== undefined) this.notificationPreferences = data.notificationPreferences;
  }
}

class UserFilterDTO {
  constructor(data) {
    this.search = data.search;
    this.role = data.role;
    this.isActive = data.isActive;
    this.page = parseInt(data.page) || 1;
    this.pageSize = parseInt(data.pageSize) || 10;
  }
}

module.exports = {
  CreateUserDTO,
  UpdateUserDTO,
  UpdateProfileDTO,
  UserFilterDTO,
};
