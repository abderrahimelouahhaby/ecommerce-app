import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),

  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),

  email: z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.email("Invalid email address"),
    )
    .transform((email) => email.toLowerCase()),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.email("Invalid email address"),
    )
    .transform((email) => email.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});
