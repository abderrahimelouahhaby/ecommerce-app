import type { Role } from "../generated/prisma/client.js";

/** The shape of the user attached to requests by the authenticate middleware. */
export type AuthUser = { id: string; role: Role };

export const isAdmin = (user: AuthUser): boolean => user.role === "ADMIN";

/** An admin may see any order; a customer only their own. */
export const canAccessOrder = (
  user: AuthUser,
  order: { userId: string },
): boolean => isAdmin(user) || order.userId === user.id;
