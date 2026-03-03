const { ROLES } = require('../../shared/constants');

class RegisterUserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || ROLES.EMPLOYEE;
    this.phone = data.phone;
  }
}

class LoginUserDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }
}

class UpdateProfileDTO {
  constructor(data) {
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
  }
}

class ChangePasswordDTO {
  constructor(data) {
    this.currentPassword = data.currentPassword;
    this.newPassword = data.newPassword;
  }
}

class ForgotPasswordDTO {
  constructor(data) {
    this.email = data.email;
  }
}

class ResetPasswordDTO {
  constructor(data) {
    this.token = data.token;
    this.newPassword = data.newPassword;
  }
}

module.exports = {
  RegisterUserDTO,
  LoginUserDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
};
