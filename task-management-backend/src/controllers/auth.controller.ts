import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh123";

// 🔹 GENERATE TOKENS
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// 🔹 REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const tokens = generateTokens(user.id);

    res.status(201).json({
      message: "User registered",
      userId: user.id,
      ...tokens,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokens = generateTokens(user.id);

    res.json({
      message: "Login successful",
      userId: user.id,
      ...tokens,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 REFRESH TOKEN
export const refresh = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// 🔹 LOGOUT (BASIC)
export const logout = (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
};
