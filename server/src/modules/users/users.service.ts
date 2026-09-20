import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found.");
  }

  return user;
}