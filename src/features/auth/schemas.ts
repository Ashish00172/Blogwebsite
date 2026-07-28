import { z } from "zod";

const emailSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.trim().toLowerCase();
}, z.string().email("Enter a valid email"));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }, z.string().min(2).optional()),
  email: emailSchema,
  password: z.string().min(8).regex(/[A-Z]/, "Include an uppercase letter").regex(/[a-z]/, "Include a lowercase letter").regex(/[0-9]/, "Include a number").regex(/[^A-Za-z0-9]/, "Include a special character"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((value) => value === true, "You must accept the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is missing"),
  password: z.string().min(8).regex(/[A-Z]/, "Include an uppercase letter").regex(/[a-z]/, "Include a lowercase letter").regex(/[0-9]/, "Include a number").regex(/[^A-Za-z0-9]/, "Include a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
