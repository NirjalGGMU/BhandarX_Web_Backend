// src/services/admin/user.service.ts

import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";

let userRepository = new UserRepository();

export class AdminUserService {
    async createUser(data: CreateUserDTO) {
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if (emailCheck) {
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if (usernameCheck) {
            throw new HttpError(403, "Username already in use");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        data.password = hashedPassword;

        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async getAllUsers() {
        const users = await userRepository.getAllUsers();
        return users;
    }

    async deleteUser(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const deleted = await userRepository.deleteUser(id);
        return deleted;
    }

    async updateUser(id: string, updateData: UpdateUserDTO) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const updatedUser = await userRepository.updateUser(id, updateData);
        return updatedUser;
    }

    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }
}


// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { config } from "../config";
// import { createUser, findUserByEmail } from "../repositories/user.repository";
// import { HttpError } from "../errors/http-error";
// import { LoginUserInput, RegisterUserInput } from "../types/user.type";

// export const registerUserService = async (input: RegisterUserInput) => {
//   const existingUser = await findUserByEmail(input.email);

//   if (existingUser) throw new HttpError("Email already exists", 409);

//   const hashedPassword = await bcrypt.hash(input.password, 10);

//   const user = await createUser({
//     name: input.name,
//     email: input.email,
//     password: hashedPassword,
//     role: input.role, // now uses input.role
//   });

//   return {
//     id: user._id,
//     email: user.email,
//     role: user.role,
//     name: user.name,
//   };
// };

// export const loginUserService = async (input: LoginUserInput) => {
//   const user = await findUserByEmail(input.email);
//   if (!user) throw new HttpError("Invalid email or password", 401);

//   const isPasswordValid = await bcrypt.compare(input.password, user.password);
//   if (!isPasswordValid) throw new HttpError("Invalid email or password", 401);

//   const token = jwt.sign({ userId: user._id, role: user.role }, config.jwtSecret, { expiresIn: "1d" });

//   return {
//     token,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     },
//   };
// };
