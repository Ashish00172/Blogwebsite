"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const nameSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
});

const statusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function createCategory(formData: FormData) {
  const parsed = nameSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid category payload");
  }

  const slug = parsed.data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  await prisma.category.upsert({
    where: { slug },
    update: { name: parsed.data.name },
    create: { name: parsed.data.name, slug },
  });

  revalidatePath("/admin");
  revalidatePath("/blogs");
  revalidatePath("/editor");
}

export async function createTag(formData: FormData) {
  const parsed = nameSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid tag payload");
  }

  const slug = parsed.data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  await prisma.tag.upsert({
    where: { slug },
    update: { name: parsed.data.name },
    create: { name: parsed.data.name, slug },
  });

  revalidatePath("/admin");
  revalidatePath("/blogs");
  revalidatePath("/editor");
}

export async function setBlogStatus(blogId: string, formData: FormData) {
  const parsed = statusSchema.safeParse({
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blog status");
  }

  const blog = await prisma.blog.update({
    where: { id: blogId },
    data: { status: parsed.data.status },
    select: { slug: true },
  });

  revalidatePath("/admin");
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
  revalidatePath(`/editor/${blog.slug}`);
}

export async function updateUserRole(userId: string, formData: FormData) {
  const role = formData.get("role");
  if (role !== "USER" && role !== "ADMIN") {
    throw new Error("Invalid role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin");
}
