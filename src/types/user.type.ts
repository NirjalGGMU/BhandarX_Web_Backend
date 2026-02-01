import { z } from "zod";
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["user", "admin"]).optional(),  // Added for admin create
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
});
export const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateInput = z.infer<typeof UpdateSchema>;


// import { z } from "zod";

// export const RegisterSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   email: z.string().email("Invalid email"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   confirmPassword: z.string(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

// export const LoginSchema = z.object({
//   email: z.string().email("Invalid email"),
//   password: z.string().min(6, "Password too short"),
// });

// export type RegisterInput = z.infer<typeof RegisterSchema>;
// export type LoginInput = z.infer<typeof LoginSchema>;



// export interface RegisterUserInput {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   role: "user" | "admin"; // added role
// }

// export interface LoginUserInput {
//   email: string;
//   password: string;
// }
