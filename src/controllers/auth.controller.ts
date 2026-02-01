import { Request, Response } from "express";
import { RegisterSchema, LoginSchema } from "../types/user.type";
import { registerUser, loginUser } from "../services/user.service";
import { setAuthToken, setUserData } from "../utils/cookieUtils";

// import { setAuthToken, setUserData } from "../utils/cookieUtils"; // Updated function for setting cookies

export const register = async (req: Request, res: Response) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.format(), // This is better and clean
    });
  }

  try {
    const data = await registerUser(result.data);
    res.status(201).json({ success: true, message: "User created successfully", data: data.user });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.format(), // Clean formatted errors
    });
  }

  try {
    const data = await loginUser(result.data);
    if (data.success) {
      // Set auth token and user data in cookies
      await setAuthToken(res, data.token); // Set token cookie
      await setUserData(res, data.user); // Set user data cookie
    }

    res.json({ success: true, message: "Login successful", token: data.token, user: data.user });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};
