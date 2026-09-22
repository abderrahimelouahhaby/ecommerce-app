import type { Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import * as authService from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.service.js";
import { env } from "../../config/env.js";

const COOKIE_NAME = "myshop_session";

/** httpOnly cookie whose expiry matches the JWT's exp claim. */
function setAuthCookie(res: Response, token: string) {
  const decoded = jwt.decode(token) as JwtPayload | null;

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: decoded?.exp ? new Date(decoded.exp * 1000) : undefined,
  });
}

export async function register(req: Request, res: Response) {
  const input = req.validated?.body as RegisterInput;
  const { user, token } = await authService.register(input);

  setAuthCookie(res, token);
  res.status(201).json({ data: user });
}

export async function login(req: Request, res: Response) {
  const input = req.validated?.body as LoginInput;
  const { user, token } = await authService.login(input);

  setAuthCookie(res, token);
  res.json({ data: user });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await authService.me(req.user!.id);
  res.json({ data: user });
}
