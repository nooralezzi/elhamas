import { notFound } from "next/navigation";
import { getVisaById } from "@/lib/db";
import { VisaDetailClient } from "./page-client";
import { getRequestLocale } from "@/lib/locale";
import { getCommonKeywords, localizeField } from "@/lib/seo";

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getRequestLocale();
  const { id } = await params;
  const item = await getVisaById(id);
  if (!item) {
    return {
      title: locale === "ar" ? "التأشيرة غير موجودة" : "Visa Not Found",
      keywords: getCommonKeywords(),
    };
  }
  return {
    title: localizeField(locale, item.name_en, item.name_ar, locale === "ar" ? "تأشيرة" : "Visa"),
    description: localizeField(locale, item.description_en, item.description_ar),
    keywords: [
      item.name_en || "Visa",
      item.name_ar || "تأشيرة",
      "Visas",
      "التأشيرات",
      ...getCommonKeywords(),
    ],
  };
}

export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getVisaById(id);
  if (!item) notFound();
  return <VisaDetailClient item={item} />;
}
