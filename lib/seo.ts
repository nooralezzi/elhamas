import type { Metadata } from "next";

import type { Locale } from "@/lib/locale";

type LocalizedValues = {
  en: string;
  ar: string;
};

const SITE_NAME: LocalizedValues = {
  en: "Elham Nasser Abu Sarahd Company",
  ar: "شركة إلهام ناصر أبو سرهد",
};

const SITE_URL = "https://elhamas.com";
const COMMON_KEYWORDS_EN = [
  "Hajj",
  "Umrah",
  "Pilgrimage",
  "Makkah",
  "Madinah",
  "Islamic Travel",
  "Saudi Arabia",
  "Holy Sites",
];

const COMMON_KEYWORDS_AR = [
  "الحج",
  "العمرة",
  "رحلات دينية",
  "مكة",
  "المدينة المنورة",
  "السفر الإسلامي",
  "السعودية",
  "المشاعر المقدسة",
];

export function getCommonKeywords(): string[] {
  return [...COMMON_KEYWORDS_EN, ...COMMON_KEYWORDS_AR];
}

export function pickByLocale(locale: Locale, values: LocalizedValues): string {
  return values[locale] ?? values.en;
}

export function localizeField(
  locale: Locale,
  enValue?: string | null,
  arValue?: string | null,
  fallback?: string,
): string | undefined {
  const preferred = locale === "ar" ? arValue : enValue;
  const secondary = locale === "ar" ? enValue : arValue;
  return preferred || secondary || fallback;
}

export function createPageMetadata(
  locale: Locale,
  values: {
    title: LocalizedValues;
    description: LocalizedValues;
    keywords?: LocalizedValues;
  },
): Metadata {
  return {
    title: pickByLocale(locale, values.title),
    description: pickByLocale(locale, values.description),
    keywords: [
      values.title.en,
      values.title.ar,
      ...(values.keywords ? [values.keywords.en, values.keywords.ar] : []),
      ...getCommonKeywords(),
    ],
  };
}

export function createSiteMetadata(locale: Locale): Metadata {
  const title = pickByLocale(locale, SITE_NAME);
  const description = pickByLocale(locale, {
    en: "Experience the spiritual journey of a lifetime with our premium Hajj and Umrah services. Trusted pilgrimage packages, luxury accommodations, and expert guidance.",
    ar: "عِش رحلة روحانية استثنائية مع خدماتنا المتميزة للحج والعمرة. باقات موثوقة، إقامة فاخرة، وإرشاد احترافي في كل خطوة.",
  });

  return {
    title: {
      default: title,
      template: `%s - ${title}`,
    },
    description,
    keywords: getCommonKeywords(),
    authors: [{ name: title }],
    creator: title,
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      url: SITE_URL,
      siteName: title,
      title,
      description,
      images: [
        {
          url: `${SITE_URL}/Logo_ilham.png`,
          width: 1200,
          height: 630,
          alt:
            locale === "ar"
              ? "شركة إلهام ناصر أبو سرهد - خدمات متميزة للحج والعمرة"
              : "Elham Nasser Abu Sarahd Company - Premium Hajj and Umrah Services",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/Logo_ilham.png`],
    },
    verification: {
      other: {
        "facebook-domain-verification": "26yfwk3dlb9x66k2wyy7c68tz9g1uv",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
