import { getVisas } from "@/lib/db";
import { VisasPageClient } from "./page-client";
import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createPageMetadata(locale, {
    title: { en: "Issuing Visas", ar: "إصدار التأشيرات" },
    description: {
      en: "Visa services for Umrah, Hajj, and travel.",
      ar: "خدمات التأشيرات للعمرة والحج والسفر.",
    },
  });
}

export default async function VisasPage() {
  const items = await getVisas();
  return <VisasPageClient items={items} />;
}
