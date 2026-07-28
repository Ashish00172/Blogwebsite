"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBlog, updateBlog } from "./actions";
import { generateSeoMetadata } from "@/features/seo/seo-service";

type BlogDraft = {
  title: string;
  slug: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  coverImage: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  categoryName: string;
  tags: string;
};

interface BlogFormProps {
  authorId?: string;
  authorName?: string | null;
  blogId?: string;
  mode?: "create" | "edit";
  initialValues?: Partial<BlogDraft>;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

function buildOutline(title: string) {
  const topic = title.trim() || "SEO Blog Strategy";
  return `# ${topic}

## Introduction
- Why this topic matters.
- What the reader will learn.

## Main Idea
- Core framework or strategy.
- Supporting examples and evidence.

## Practical Steps
1. Research the topic.
2. Structure the article.
3. Add SEO metadata and internal links.

## Conclusion
- Summarize the key takeaway.
- Suggest the next action for the reader.`;
}

function expandContent(title: string, content: string) {
  const topic = title.trim() || "the article";
  const base = content.trim();
  return `${base}\n\n### Practical expansion for ${topic}\n- Add a short example that shows the concept in action.\n- Include a checklist or framework readers can reuse.\n- Reinforce the main takeaway with a clear next step.`;
}

export function BlogForm({ authorId, authorName, blogId, mode = "create", initialValues }: BlogFormProps) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug && mode === "edit"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<BlogDraft>({
    title: initialValues?.title ?? "",
    slug: initialValues?.slug ?? "",
    content: initialValues?.content ?? "",
    status: initialValues?.status ?? "DRAFT",
    excerpt: initialValues?.excerpt ?? "",
    metaTitle: initialValues?.metaTitle ?? "",
    metaDescription: initialValues?.metaDescription ?? "",
    keywords: initialValues?.keywords ?? "",
    coverImage: initialValues?.coverImage ?? "",
    canonicalUrl: initialValues?.canonicalUrl ?? "",
    ogTitle: initialValues?.ogTitle ?? "",
    ogDescription: initialValues?.ogDescription ?? "",
    categoryName: initialValues?.categoryName ?? "",
    tags: initialValues?.tags ?? "",
  });

  const wordCount = useMemo(() => form.content.trim().split(/\s+/).filter(Boolean).length, [form.content]);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const tagList = splitTags(form.tags);
  const previewExcerpt = form.excerpt.trim() || form.content.trim().slice(0, 160) || "Write a short summary to guide readers.";
  const previewTitle = form.title.trim() || "Your article title";
  const previewCategory = form.categoryName.trim() || "Uncategorized";
  const previewMetaTitle = form.metaTitle.trim() || previewTitle;
  const previewMetaDescription = form.metaDescription.trim() || previewExcerpt;
  const coverImage = form.coverImage.trim();
  const submitBlog = mode === "edit" && blogId ? updateBlog.bind(null, blogId, authorId ?? "") : createBlog.bind(null, authorId ?? "");

  function applySeoAssist() {
    const seo = generateSeoMetadata(form.title || previewTitle, form.content || form.excerpt || form.title);
    setForm((current) => ({
      ...current,
      slug: slugTouched ? current.slug : seo.slug,
      metaTitle: seo.seoTitle,
      metaDescription: seo.metaDescription,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
    }));
  }

  function applyTitleIdeas() {
    const topic = form.categoryName.trim() || form.title.trim() || "SEO Blogging";
    const suggestion = `${topic} Playbook for Modern Teams`;
    setForm((current) => ({
      ...current,
      title: suggestion,
      slug: slugTouched ? current.slug : slugify(suggestion),
    }));
  }

  function applyOutline() {
    setForm((current) => ({
      ...current,
      content: current.content.trim() ? `${current.content.trim()}\n\n${buildOutline(current.title)}` : buildOutline(current.title),
    }));
  }

  function applyExpansion() {
    setForm((current) => ({
      ...current,
      content: expandContent(current.title, current.content),
      excerpt: current.excerpt.trim() || current.content.trim().slice(0, 160),
    }));
  }

  function applySummary() {
    const summarySource = form.content.trim() || form.title.trim();
    setForm((current) => ({
      ...current,
      excerpt: summarySource.slice(0, 160),
      metaDescription: summarySource.slice(0, 155),
    }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        excerpt: form.excerpt.trim() || undefined,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        keywords: form.keywords.trim() || undefined,
        coverImage: form.coverImage.trim() || undefined,
        canonicalUrl: form.canonicalUrl.trim() || undefined,
        ogTitle: form.ogTitle.trim() || undefined,
        ogDescription: form.ogDescription.trim() || undefined,
        categoryName: form.categoryName.trim() || undefined,
        tags: form.tags.trim() || undefined,
      };

      const result = await submitBlog(payload);
      router.push(`/blogs/${result.slug}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Draft details</p>
          <h2 className="text-2xl font-semibold text-slate-950">{mode === "edit" ? "Edit your article" : "Compose your article"}</h2>
          <p className="text-sm leading-6 text-slate-600">
            Add SEO fields, choose a category, attach a cover image, and use the AI helpers to draft faster.
          </p>
          {authorName ? <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Publishing as {authorName}</p> : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={applyTitleIdeas} className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
            Generate title idea
          </Button>
          <Button type="button" onClick={applyOutline} className="rounded-full bg-cyan-600 text-white hover:bg-cyan-500">
            Generate outline
          </Button>
          <Button type="button" onClick={applySeoAssist} className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            Generate SEO pack
          </Button>
          <Button type="button" onClick={applyExpansion} className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            Expand content
          </Button>
          <Button type="button" onClick={applySummary} className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            Summarize
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="AI SEO Strategy for Modern SaaS Teams"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((current) => ({
                  ...current,
                  title,
                  slug: slugTouched ? current.slug : slugify(title),
                }));
              }}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="ai-seo-strategy-for-modern-saas-teams"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm({ ...form, slug: e.target.value });
              }}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">Leave it blank to keep the title-based slug. Duplicate slugs are auto-suffixed.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="Strategy"
              value={form.categoryName}
              onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as BlogDraft["status"] })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Publish</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Tags</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="seo, ai content, blogging"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">Separate tags with commas for better filtering and organization.</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Excerpt</label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="A short summary that invites readers into the article."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Cover image URL</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="https://images.example.com/cover.jpg"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">Paste a public image URL to give the article a strong visual lead.</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Content</label>
            <textarea
              className="mt-2 min-h-60 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-cyan-500"
              placeholder="Write your article"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Meta title</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="SEO-friendly headline"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Keywords</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="seo, ai content, blogging"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Meta description</label>
            <textarea
              className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="A concise description for search results."
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Canonical URL</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="https://example.com/blog/post"
              value={form.canonicalUrl}
              onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Open Graph title</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="Social sharing title"
              value={form.ogTitle}
              onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Open Graph description</label>
            <textarea
              className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="Social sharing description."
              value={form.ogDescription}
              onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-cyan-600 py-3 text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving article..." : mode === "edit" ? "Update article" : form.status === "PUBLISHED" ? "Publish article" : "Save draft"}
        </Button>
      </form>

      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live preview</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{previewTitle}</h3>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1">{previewCategory}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{readingTime} min read</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{form.status.toLowerCase()}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {coverImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt={previewTitle} className="h-48 w-full object-cover" />
            </>
          ) : (
            <div className="flex h-48 items-center justify-center bg-linear-to-br from-cyan-500/30 via-white/5 to-slate-950 px-6 text-center text-sm text-slate-300">
              Add a cover image URL to make the card pop.
            </div>
          )}
          <div className="space-y-4 p-5">
            <p className="text-sm leading-7 text-slate-300">{previewExcerpt}</p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">SEO snapshot</p>
              <p className="mt-2">Meta title: {previewMetaTitle}</p>
              <p className="mt-1">Meta description: {previewMetaDescription}</p>
              <p className="mt-1">Canonical URL: {form.canonicalUrl.trim() || "Not set"}</p>
              <p className="mt-1">Keywords: {form.keywords.trim() || "None set yet"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Words</p>
            <p className="mt-2 text-2xl font-semibold text-white">{wordCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Reading time</p>
            <p className="mt-2 text-2xl font-semibold text-white">{readingTime} min</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white">Tag preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tagList.length > 0 ? (
              tagList.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">No tags yet</span>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
