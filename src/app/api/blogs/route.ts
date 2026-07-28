import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBlogRecord, listBlogs } from "@/features/blog/service";

export async function GET() {
  const blogs = await listBlogs();
  return NextResponse.json(blogs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const author = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!author) {
    return NextResponse.json({ error: "No author available" }, { status: 400 });
  }

  const blog = await createBlogRecord(body.authorId ?? author.id, body);

  return NextResponse.json(blog);
}
