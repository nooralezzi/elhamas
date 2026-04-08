import { cookies, headers } from "next/headers";

export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: Locale = "ar";
const LOCALE_COOKIE_KEY = "elhamas-locale";

function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ar";
}

function localeFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;
  const lowered = acceptLanguage.toLowerCase();
  if (lowered.includes("ar")) return "ar";
  if (lowered.includes("en")) return "en";
  return null;
}

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  const acceptedLocale = localeFromAcceptLanguage(
    headerStore.get("accept-language"),
  );

  return acceptedLocale ?? DEFAULT_LOCALE;
}

export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}
