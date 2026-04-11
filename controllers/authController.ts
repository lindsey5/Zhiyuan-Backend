import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/auth";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    // Find user and populate role
    const user = await User.findOne({ email, status: "active" }).populate(
      "role",
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password." });
    }

    const accessToken = generateAccessToken(user._id, user.role?._id);
    const refreshToken = generateRefreshToken(user._id);

    const { password: userPassword, role, _id, ...rest } = user.toObject();

    res.status(200).json({
      success: true,
      user: {
        ...rest,
        role: role?.name,
      },
      token: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token required" });
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret-key",
    );

    const user = await User.findById(decoded.id).populate("role");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user._id, user.role?._id);
    const newRefreshToken = generateRefreshToken(user._id);

    const { password: userPassword, role, _id, ...rest } = user.toObject();

    res.status(200).json({
      success: true,
      user: {
        ...rest,
        role: role?.name,
      },
      token: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};
