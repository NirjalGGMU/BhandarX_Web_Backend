import { Response } from "express";

export const setAuthToken = (res: Response, token: string) => {
  // Set auth token in cookies
  res.cookie("auth_token", token, {
    httpOnly: true, // Ensure the cookie is not accessible via JavaScript
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "lax", // Same site cookie policy
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days expiration
    path: "/",
  });
};

export const setUserData = (res: Response, user: any) => {
  // Set user data in cookies
  res.cookie("user_data", JSON.stringify(user), {
    httpOnly: true, // Ensure the cookie is not accessible via JavaScript
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "lax", // Same site cookie policy
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days expiration
    path: "/",
  });
};

export const clearAuthCookies = (res: Response) => {
  // Clear cookies on logout
  res.clearCookie("auth_token");
  res.clearCookie("user_data");
};
