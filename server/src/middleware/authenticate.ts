import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const COOKIE_NAME = "myshop_session";

/**
 * Reads the session cookie, verifies the JWT, and loads the user
 * (role + isActive) from the database so authorization never runs
 * on stale data.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    throw new AppError(401, "UNAUTHENTICATED", "Please log in.");
  }

  let payload: { userId: string };

  try {
    payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
  } catch {
    throw new AppError(401, "UNAUTHENTICATED", "Please log in.");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isActive: true },
  });

  // Deactivated users keep their cookie but can no longer access the API.
  if (!user || !user.isActive) {
    res.clearCookie(COOKIE_NAME);
    throw new AppError(401, "UNAUTHENTICATED", "Please log in.");
  }

  req.user = { id: user.id, role: user.role };
  next();
}
