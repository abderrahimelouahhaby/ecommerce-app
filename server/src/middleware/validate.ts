import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

/**
 * Validates request body/params/query with Zod and stores the
 * parsed (clean) data on req.validated, which controllers read.
 * Invalid input throws a ZodError that the error handler turns
 * into a 400 VALIDATION_ERROR response.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated: NonNullable<Request["validated"]> = {};

      if (schemas.body) validated.body = schemas.body.parse(req.body);
      if (schemas.params) validated.params = schemas.params.parse(req.params);
      if (schemas.query) validated.query = schemas.query.parse(req.query);

      req.validated = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
}
