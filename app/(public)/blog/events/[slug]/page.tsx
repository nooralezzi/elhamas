import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db";
import { EventDetailClient } from "./page-client";
import { getRequestLocale } from "@/lib/locale";
import { getCommonKeywords, localizeField } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return {
      title: locale === "ar" ? "الفعالية غير موجودة" : "Event Not Found",
      keywords: getCommonKeywords(),
    };
  }
  return {
    title: localizeField(
      locale,
      event.title_en,
      event.title_ar,
      locale === "ar" ? "فعالية" : "Event",
    ),
    description: localizeField(
      locale,
      event.short_description_en,
      event.short_description_ar,
    ),
    keywords: [
      event.title_en || "Event",
      event.title_ar || "فعالية",
      "Events",
      "الفعاليات",
      ...getCommonKeywords(),
    ],
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  return <EventDetailClient event={event} />;
}
