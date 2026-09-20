import type { Role } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      /** The logged-in user, set by the authenticate middleware. */
      user?: { id: string; role: Role };
      /** Data parsed by the validate middleware. */
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};