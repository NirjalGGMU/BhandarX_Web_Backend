import { UserModel } from "../models/user.model";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/user.dto";

export class UserRepository {
    async getUserByEmail(email: string) {
        return await UserModel.findOne({ email });
    }

    async getUserByUsername(username: string) {
        return await UserModel.findOne({ username });
    }

    async createUser(userData: CreateUserDTO) {
        const user = new UserModel(userData);
        return await user.save();
    }

    async getUserById(id: string) {
        return await UserModel.findById(id).select('-password');
    }

    async updateUser(id: string, updateData: UpdateUserDTO) {
        return await UserModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');
    }

    async deleteUser(id: string) {
        return await UserModel.findByIdAndDelete(id);
    }

    async getAllUsers() {
        return await UserModel.find().select('-password');
    }
}


// import { UserModel } from "../models/user.model";

// export const getUserByEmail = async (email: string) => {
//   return await UserModel.findOne({ email });
// };

// export const createUser = async (userData: any) => {
//   const user = new UserModel(userData);
//   return await user.save();
// };

// export const findAllUsers = async () => {
//   return await UserModel.find().select("-password");
// };

// export const findUserById = async (id: string) => {
//   return await UserModel.findById(id).select("-password");
// };

// export const updateUserById = async (id: string, updateData: any) => {
//   return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
// };

// export const deleteUserById = async (id: string) => {
//   return await UserModel.findByIdAndDelete(id);
// };

// import { UserModel } from "../models/user.model";

// export const getUserByEmail = async (email: string) => {
//   return await UserModel.findOne({ email });
// };

// export const createUser = async (userData: any) => {
//   const user = new UserModel(userData);
//   return await user.save();
// };








// import { User, IUser } from "../models/user.model";

// export const findUserByEmail = async (email: string): Promise<IUser | null> => {
//   return User.findOne({ email });
// };

// export const createUser = async (data: Partial<IUser>): Promise<IUser> => {
//   return User.create(data);
// };
