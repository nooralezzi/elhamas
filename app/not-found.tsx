import Link from "next/link";

import { getRequestLocale } from "@/lib/locale";

export default async function NotFoundPage() {
  const locale = await getRequestLocale();
  const isArabic = locale === "ar";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          {isArabic ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          {isArabic
            ? "عذرًا، الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها."
            : "Sorry, the page you are looking for does not exist or may have been moved."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {isArabic ? "العودة للرئيسية" : "Back To Home"}
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </Link>
        </div>
      </section>
    </main>
  );
}
