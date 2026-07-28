"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name should be at least 2 characters long"),
  title: optionalText,
  location: optionalText,
  website: optionalText,
  bio: optionalText,
  image: optionalText,
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a special character"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function updateProfile(userId: string, input: unknown) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile payload");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.fullName,
      title: parsed.data.title ?? null,
      location: parsed.data.location ?? null,
      website: parsed.data.website ?? null,
      bio: parsed.data.bio ?? null,
      image: parsed.data.image ?? null,
    },
  });

  revalidatePath("/profile");

  return {
    success: true,
    profile: {
      fullName: updatedUser.name ?? "",
      title: updatedUser.title ?? "",
      location: updatedUser.location ?? "",
      website: updatedUser.website ?? "",
      bio: updatedUser.bio ?? "",
      image: updatedUser.image ?? "",
    },
  };
}

export async function changePassword(userId: string, formData: FormData) {
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid password payload");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user?.password) {
    throw new Error("No password is set for this account");
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const nextPassword = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: nextPassword,
      passwordUpdatedAt: new Date(),
    },
  });

  revalidatePath("/profile");

  return {
    success: true,
    message: "Password updated successfully.",
  };
}
