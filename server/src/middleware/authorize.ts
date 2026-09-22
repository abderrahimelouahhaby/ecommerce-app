import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";

/** Restricts a route to the given roles, e.g. authorize("ADMIN"). */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "UNAUTHENTICATED", "Please log in.");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to do this.",
      );
    }

    next();
  };
}
