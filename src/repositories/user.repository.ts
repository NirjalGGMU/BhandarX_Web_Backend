import { UserModel } from "../models/user.model";

export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};

export const createUser = async (userData: any) => {
  const user = new UserModel(userData);
  return await user.save();
};

// import { User, IUser } from "../models/user.model";

// export const findUserByEmail = async (email: string): Promise<IUser | null> => {
//   return User.findOne({ email });
// };

// export const createUser = async (data: Partial<IUser>): Promise<IUser> => {
//   return User.create(data);
// };
