import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  "dummy-password-for-equal-timing",
  12,
);

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/** Public user fields — never expose passwordHash. */
const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const;

function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export async function register(input: RegisterInput) {
  if (!env.ALLOW_REGISTRATION) {
    throw new AppError(
      403,
      "REGISTRATION_DISABLED",
      "Registration is currently closed.",
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "This email is already registered.",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  // Role is never taken from the request — new users are always CUSTOMER.
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
    },
    select: publicUserSelect,
  });

  return { user, token: signToken(user.id) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      passwordHash: true,
      isActive: true,
    },
  });

  const passwordMatches = await bcrypt.compare(
    input.password,
    user ? user.passwordHash : DUMMY_PASSWORD_HASH,
  );

  if (!user || !passwordMatches) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }

  // Only revealed after the password is correct (don't leak account state).
  if (!user.isActive) {
    throw new AppError(
      403,
      "ACCOUNT_DEACTIVATED",
      "This account has been deactivated.",
    );
  }

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token: signToken(user.id),
  };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...publicUserSelect, createdAt: true },
  });

  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found.");
  }

  return user;
}
