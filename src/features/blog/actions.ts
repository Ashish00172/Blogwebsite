"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import { createBlogRecord, deleteBlogRecord, updateBlogRecord } from "./service";

const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

async function requireSession() {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("You must be signed in to continue");
  }
  return session;
}

export async function createBlog(authorId: string, input: unknown) {
  const blog = await createBlogRecord(authorId, input);

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);

  return {
    success: true,
    slug: blog.slug,
  };
}

export async function updateBlog(blogId: string, actorId: string, input: unknown) {
  const blog = await updateBlogRecord(blogId, actorId, input);

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
  revalidatePath(`/editor/${blog.slug}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    slug: blog.slug,
  };
}

export async function deleteBlog(blogId: string, slug: string, actorId: string) {
  await deleteBlogRecord(blogId, actorId);

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function toggleBlogLike(blogId: string) {
  const session = await requireSession();
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, slug: true },
  });

  if (!blog) {
    throw new Error("Blog not found");
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_blogId: {
        userId: session.user.id,
        blogId,
      },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: {
        userId: session.user.id,
        blogId,
      },
    });
  }

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
}

export async function toggleBlogBookmark(blogId: string) {
  const session = await requireSession();
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, slug: true },
  });

  if (!blog) {
    throw new Error("Blog not found");
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_blogId: {
        userId: session.user.id,
        blogId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        blogId,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/saved");
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
}

export async function addBlogComment(blogId: string, formData: FormData) {
  const session = await requireSession();
  const parsed = commentSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid comment");
  }

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, slug: true },
  });

  if (!blog) {
    throw new Error("Blog not found");
  }

  await prisma.comment.create({
    data: {
      blogId: blog.id,
      userId: session.user.id,
      content: parsed.data.content,
    },
  });

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
}

export async function toggleBlogSubscription(authorId: string, slug: string) {
  const session = await requireSession();

  if (authorId === session.user.id) {
    throw new Error("You cannot subscribe to your own blog");
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { id: true },
  });

  if (!author) {
    throw new Error("Author not found");
  }

  const existing = await prisma.subscription.findUnique({
    where: {
      subscriberId_authorId: {
        subscriberId: session.user.id,
        authorId,
      },
    },
  });

  if (existing) {
    await prisma.subscription.delete({ where: { id: existing.id } });
  } else {
    await prisma.subscription.create({
      data: {
        subscriberId: session.user.id,
        authorId,
      },
    });
  }

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
}
