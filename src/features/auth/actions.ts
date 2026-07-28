"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getPrismaClient } from "@/lib/prisma";
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from "./schemas";
import { buildPasswordResetUrl, sendPasswordResetEmail } from "@/lib/email";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createUniqueUsername(prisma: ReturnType<typeof getPrismaClient>, preferredUsername: string | undefined, email: string) {
  const baseSource = preferredUsername ?? email.split("@")[0] ?? "user";
  const baseUsername = slugify(baseSource) || "user";

  let username = baseUsername;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${baseUsername}-${suffix}`;
  }

  return username;
}

export async function loginAction(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return { success: true };
}

export async function registerAction(input: unknown) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const prisma = getPrismaClient();
  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already taken");
  }

  const password = await bcrypt.hash(parsed.data.password, 10);
  const username = await createUniqueUsername(prisma, parsed.data.username, email);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      username,
      email,
      password,
      passwordUpdatedAt: new Date(),
      role: "USER",
      emailVerified: new Date(),
    },
  });

  return { success: true };
}

export async function forgotPasswordAction(input: unknown) {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const prisma = getPrismaClient();
  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, name: true },
  });

  if (!user) {
    return { success: true, message: "If that email exists, a reset link has been sent." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  try {
    await sendPasswordResetEmail({
      to: email,
      name: user.name,
      resetUrl: buildPasswordResetUrl(token),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      await prisma.passwordResetToken.deleteMany({
        where: { email, token },
      });
      throw error instanceof Error ? error : new Error("Unable to send reset email");
    }

    return {
      success: true,
      message: error instanceof Error ? error.message : "Email delivery failed, but a reset link was created for development.",
      resetUrl: buildPasswordResetUrl(token),
    };
  }

  return { success: true, message: "If that email exists, a reset link has been sent." };
}

export async function resetPasswordAction(input: unknown) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const prisma = getPrismaClient();
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!resetToken || resetToken.expires.getTime() < Date.now()) {
    if (resetToken) {
      await prisma.passwordResetToken.delete({ where: { token: resetToken.token } });
    }
    throw new Error("That reset link is invalid or expired");
  }

  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.updateMany({
    where: { email: resetToken.email },
    data: { password, passwordUpdatedAt: new Date() },
  });

  await prisma.passwordResetToken.delete({ where: { token: resetToken.token } });

  return { success: true, message: "Password reset successfully." };
}
