import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    const body: {
      error: {
        code: string;
        message: string;
        details?: { field: string; message: string }[];
      };
    } = {
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (error.details) {
      body.error.details = error.details;
    }

    return res.status(error.statusCode).json(body);
  }

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Some fields are invalid.",
        details,
      },
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: {
          code: "ALREADY_EXISTS",
          message: "A record with these details already exists.",
        },
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Record not found.",
        },
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "This record is still in use.",
        },
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong.",
    },
  });
}
