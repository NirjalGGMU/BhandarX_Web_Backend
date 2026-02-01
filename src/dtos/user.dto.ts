// DTOs for User operations
import { z } from "zod";
import { RegisterSchema, LoginSchema } from "../types/user.type";

// Reuse RegisterSchema from types, but add confirmPassword validation
export const CreateUserDTO = RegisterSchema.pick({
  name: true,
  email: true,
  password: true,
}).extend({
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords do not match", path: ["confirmPassword"] },
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Simple login DTO (reuses parts of LoginSchema)
export const LoginUserDTO = LoginSchema;
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;