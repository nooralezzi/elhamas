import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/db";
import { ArticleDetailClient } from "./page-client";
import { getRequestLocale } from "@/lib/locale";
import { getCommonKeywords, localizeField } from "@/lib/seo";

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.is_published) {
    return {
      title: locale === "ar" ? "المقال غير موجود" : "Article Not Found",
      keywords: getCommonKeywords(),
    };
  }
  return {
    title: localizeField(locale, post.title_en, post.title_ar, locale === "ar" ? "مقال" : "Article"),
    description: localizeField(locale, post.excerpt_en, post.excerpt_ar),
    keywords: [
      post.title_en || "Article",
      post.title_ar || "مقال",
      "Blog",
      "مدونة",
      ...getCommonKeywords(),
    ],
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.is_published) notFound();
  return <ArticleDetailClient post={post} />;
}
