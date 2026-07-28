import "server-only";

import type { Blog, Bookmark, Category, Comment, Prisma, Tag, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

export const blogInputSchema = z.object({
  title: z.string().trim().min(3, "Title should be at least 3 characters long"),
  slug: optionalText,
  content: z.string().trim().min(10, "Content should be at least 10 characters long"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  excerpt: optionalText,
  metaTitle: optionalText,
  metaDescription: optionalText,
  keywords: optionalText,
  coverImage: optionalText,
  canonicalUrl: optionalText,
  ogTitle: optionalText,
  ogDescription: optionalText,
  categoryName: optionalText,
  tags: optionalText,
});

export type BlogInput = z.infer<typeof blogInputSchema>;

export type BlogComment = Comment & {
  user: Pick<User, "id" | "name" | "username" | "image">;
};

export type BlogWithRelations = Blog & {
  author: User;
  category: Category | null;
  tags: Tag[];
  comments: BlogComment[];
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
};

export type SavedBlog = Bookmark & {
  blog: BlogWithRelations;
};

const savedBlogInclude = {
  blog: {
    include: blogInclude(),
  },
} satisfies Prisma.BookmarkInclude;

export type BlogFilters = {
  query?: string;
  category?: string;
  tag?: string;
  status?: string;
  authorId?: string;
  sort?: "latest" | "oldest";
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createUniqueSlug(baseValue: string) {
  const baseSlug = slugify(baseValue);
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.blog.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

async function resolveCategory(categoryName: string | undefined) {
  if (!categoryName) return null;

  const slug = slugify(categoryName);
  return prisma.category.upsert({
    where: { slug },
    update: { name: categoryName.trim() },
    create: {
      name: categoryName.trim(),
      slug,
    },
  });
}

function splitTags(tagsValue: string | undefined) {
  return Array.from(
    new Set(
      (tagsValue ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

async function resolveTags(tagsValue: string | undefined) {
  const tagNames = splitTags(tagsValue);
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { name, slug: slugify(name) },
      }),
    ),
  );

  return tags;
}

function blogInclude() {
  return {
    author: true,
    category: true,
    tags: true,
    comments: {
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
        bookmarks: true,
      },
    },
  } as const;
}

export async function createBlogRecord(authorId: string, input: unknown) {
  const parsed = blogInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blog payload");
  }

  const category = await resolveCategory(parsed.data.categoryName);
  const tags = await resolveTags(parsed.data.tags);
  const slug = await createUniqueSlug(parsed.data.slug ?? parsed.data.title);
  const excerpt = parsed.data.excerpt ?? parsed.data.content.slice(0, 160);
  const metaTitle = parsed.data.metaTitle ?? parsed.data.title;
  const metaDescription = parsed.data.metaDescription ?? excerpt;

  return prisma.blog.create({
    data: {
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt,
      status: parsed.data.status,
      metaTitle,
      metaDescription,
      keywords: parsed.data.keywords,
      coverImage: parsed.data.coverImage,
      canonicalUrl: parsed.data.canonicalUrl,
      ogTitle: parsed.data.ogTitle,
      ogDescription: parsed.data.ogDescription,
      authorId,
      categoryId: category?.id,
      tags: tags.length > 0 ? { connect: tags.map((tag) => ({ id: tag.id })) } : undefined,
    },
  });
}

async function assertBlogOwner(blogId: string, actorId: string) {
  const existing = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, slug: true, authorId: true },
  });

  if (!existing) {
    throw new Error("Blog not found");
  }

  if (existing.authorId !== actorId) {
    throw new Error("You can only modify your own blog posts");
  }

  return existing;
}

export async function updateBlogRecord(blogId: string, actorId: string, input: unknown) {
  const parsed = blogInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blog payload");
  }

  const existing = await assertBlogOwner(blogId, actorId);

  const category = await resolveCategory(parsed.data.categoryName);
  const tags = await resolveTags(parsed.data.tags);
  const baseSlug = parsed.data.slug ?? parsed.data.title;
  const nextSlug = slugify(baseSlug);
  const slug = nextSlug === existing.slug ? existing.slug : await createUniqueSlug(baseSlug);
  const excerpt = parsed.data.excerpt ?? parsed.data.content.slice(0, 160);
  const metaTitle = parsed.data.metaTitle ?? parsed.data.title;
  const metaDescription = parsed.data.metaDescription ?? excerpt;

  return prisma.blog.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt,
      status: parsed.data.status,
      metaTitle,
      metaDescription,
      keywords: parsed.data.keywords,
      coverImage: parsed.data.coverImage,
      canonicalUrl: parsed.data.canonicalUrl,
      ogTitle: parsed.data.ogTitle,
      ogDescription: parsed.data.ogDescription,
      categoryId: category?.id,
      tags: {
        set: [],
        connect: tags.map((tag) => ({ id: tag.id })),
      },
    },
  });
}

export async function deleteBlogRecord(blogId: string, actorId: string) {
  await assertBlogOwner(blogId, actorId);
  await prisma.blog.delete({ where: { id: blogId } });
}

export async function listBlogs(filters: BlogFilters = {}): Promise<BlogWithRelations[]> {
  const query = filters.query?.trim();
  const category = filters.category?.trim();
  const tag = filters.tag?.trim();
  const status = filters.status?.trim();

  return prisma.blog.findMany({
    where: {
      authorId: filters.authorId,
      status: status && status !== "all" ? status : undefined,
      category: category && category !== "all" ? { slug: category } : undefined,
      tags: tag && tag !== "all" ? { some: { slug: tag } } : undefined,
      OR: query
        ? [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
            { keywords: { contains: query } },
            { category: { name: { contains: query } } },
            { tags: { some: { name: { contains: query } } } },
          ]
        : undefined,
    },
    orderBy: { createdAt: filters.sort === "oldest" ? "asc" : "desc" },
    include: blogInclude(),
  });
}

export async function getBlogBySlug(slug: string) {
  return prisma.blog.findUnique({
    where: { slug },
    include: blogInclude(),
  });
}

export async function getLatestPublishedBlog() {
  return prisma.blog.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: blogInclude(),
  });
}

export async function listSavedBlogs(userId: string): Promise<SavedBlog[]> {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: savedBlogInclude,
  }) as unknown as SavedBlog[];
}

export async function getBlogById(id: string) {
  return prisma.blog.findUnique({
    where: { id },
    include: blogInclude(),
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { blogs: true },
      },
    },
  });
}

export async function listTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { blogs: true },
      },
    },
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      role: true,
      passwordUpdatedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          blogs: true,
          likes: true,
          bookmarks: true,
        },
      },
    },
  });
}

export async function getDashboardStats() {
  const [totalUsers, totalBlogs, publishedBlogs, draftBlogs, categoriesCount, tagsCount, loginRecordsCount] = await Promise.all([
    prisma.user.count(),
    prisma.blog.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.blog.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.loginActivity.count(),
  ]);

  return {
    totalUsers,
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    categoriesCount,
    tagsCount,
    loginRecordsCount,
  };
}
