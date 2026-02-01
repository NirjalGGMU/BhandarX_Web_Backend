import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByEmail, createUser } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config"; // Ensure secret is imported

export const registerUser = async (data: any) => {
  const existingUser = await getUserByEmail(data.email);
  if (existingUser) {
    throw new HttpError(400, "Email already exists");
  }

  const hashedPassword = await bcryptjs.hash(data.password, 10);

  const newUser = await createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: "user",
  });

  return {
    message: "User created successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

export const loginUser = async (data: any) => {
  const user = await getUserByEmail(data.email);
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isValid = await bcryptjs.compare(data.password, user.password);
  if (!isValid) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" } // Set expiration
  );

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

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
