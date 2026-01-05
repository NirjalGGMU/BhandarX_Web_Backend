import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { createUser, findUserByEmail } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { LoginUserInput, RegisterUserInput } from "../types/user.type";

export const registerUserService = async (input: RegisterUserInput) => {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new HttpError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await createUser({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: "user",
  });

  return {
    id: user._id,
    email: user.email,
    role: user.role,
  };
};

export const loginUserService = async (input: LoginUserInput) => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new HttpError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new HttpError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
