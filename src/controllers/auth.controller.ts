import { Request, Response } from "express";
import { registerUserSchema, loginUserSchema } from "../dtos/user.dto";
import { registerUserService, loginUserService } from "../services/user.service";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    const result = await registerUserService(validatedData);

    res.status(201).json({
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const validatedData = loginUserSchema.parse(req.body);
    const result = await loginUserService(validatedData);

    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};
