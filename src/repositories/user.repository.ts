import { UserModel } from "../models/user.model";

export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};

export const createUser = async (userData: any) => {
  const user = new UserModel(userData);
  return await user.save();
};

export const findAllUsers = async () => {
  return await UserModel.find().select("-password");
};

export const findUserById = async (id: string) => {
  return await UserModel.findById(id).select("-password");
};

export const updateUserById = async (id: string, updateData: any) => {
  return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
};

export const deleteUserById = async (id: string) => {
  return await UserModel.findByIdAndDelete(id);
};

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
