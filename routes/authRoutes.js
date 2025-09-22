import express from "express";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

router.route("/register").post(async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400);
      throw new Error("User with this email already exists");
    }

    const user = await User.create({ name, email, password });

    // Create Tokens
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Set refresh token in HTTP-Only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.route("/login").post(async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials ");
    }

    if (!(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Create Tokens
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Set refresh token in HTTP-Only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.route("/logout").post(async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.route("/refresh").post(async (req, res, next) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error("No refresh token");
  }

  const { payload } = await jwtVerify(token, JWT_SECRET);

  const user = await User.findById(payload.userId);

  if (!user) {
    res.status(401);
    throw new Error("No user");
  }

  const newAccessToken = await generateToken(
    { userId: user._id.toString() },
    "1m"
  );

  res.json({
    user: { id: user._id, name: user.name, email: user.email },
    accessToken: newAccessToken,
  });

  try {
  } catch (err) {}
});

export default router;
