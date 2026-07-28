export function generateSeoMetadata(title: string, content: string) {
  const cleanTitle = title.trim().slice(0, 60);
  const summary = content.replace(/<[^>]+>/g, " ").trim().slice(0, 155);
  const keywords = Array.from(new Set(title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0, 6))).join(", ");

  return {
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    seoTitle: cleanTitle,
    metaDescription: summary || "SEO optimized blog content generated for search performance.",
    keywords,
    canonicalUrl: `/blogs/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    ogTitle: cleanTitle,
    ogDescription: summary || "AI-powered SEO blog content.",
  };
}
