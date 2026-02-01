import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { findAllUsers, findUserById, createUser, updateUserById, deleteUserById, getUserByEmail } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { RegisterSchema, UpdateSchema } from "../types/user.type";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await findAllUsers();
  res.json({ success: true, users });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await findUserById(req.params.id as string);
  if (!user) throw new HttpError(404, "User not found");
  res.json({ success: true, user });
};

export const createAdminUser = async (req: Request, res: Response) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: result.error.format() });
  }
  const data = result.data;
  const existing = await getUserByEmail(data.email);  // Reuse from repo
  if (existing) throw new HttpError(400, "Email exists");
  const hashed = await bcryptjs.hash(data.password, 10);
  const image = req.file ? `/uploads/${req.file.filename}` : "";
  const newUser = await createUser({
    name: data.name,
    email: data.email,
    password: hashed,
    role: data.role || "user",
    image,
  });
  res.status(201).json({ success: true, user: newUser });
};

export const updateAdminUser = async (req: Request, res: Response) => {
  const result = UpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: result.error.format() });
  }
  const updateData: any = result.data;
  if (updateData.password) updateData.password = await bcryptjs.hash(updateData.password, 10);
  delete updateData.confirmPassword;
  if (req.file) updateData.image = `/uploads/${req.file.filename}`;
  const updated = await updateUserById(req.params.id as string, updateData);
  if (!updated) throw new HttpError(404, "User not found");
  res.json({ success: true, user: updated });
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  const deleted = await deleteUserById(req.params.id as string);
  if (!deleted) throw new HttpError(404, "User not found");
  res.json({ success: true, message: "User deleted" });
};