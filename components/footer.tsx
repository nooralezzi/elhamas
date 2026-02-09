'use client';

import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const quickLinkKeys: { href: string; key: string }[] = [
  { href: "/", key: "nav.home" },
  { href: "/packages", key: "nav.packages" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
]

const serviceLinkKeys: { href: string; key: string }[] = [
  { href: "/packages", key: "footer.hajjPackages" },
  { href: "/packages", key: "footer.umrahPackages" },
  { href: "/packages", key: "nav.hotels" },
  { href: "/packages", key: "nav.transportation" },
]

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
                <img src="/Logo.png" alt="EA for Umrah Services" width={80} height={80} className="h-30 w-32 object-contain" />
              {/* <div>
                <span className="font-serif text-lg font-bold">Ilham Nasser Abu Sirahd Company</span>
                <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/50">Hajj & Umrah Services</p>
              </div> */}
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-primary-foreground/60">
              {t("footer.description")}
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/60">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +966 12 552 2200</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@ilhamas.com</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Makkah, Saudi Arabia</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              {quickLinkKeys.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">{t("footer.services")}</h3>
            <ul className="space-y-2">
              {serviceLinkKeys.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          {/* <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">Newsletter</h3>
            <p className="mb-4 text-sm text-primary-foreground/50">Subscribe to receive updates on our latest packages and promotions.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
          </div> */}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 py-6 sm:flex-row">
          <p className="text-xs text-primary-foreground/40">
            &copy; {new Date().getFullYear()} {t("footer.companyName")}. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-primary-foreground/40 transition-colors hover:text-primary-foreground/60">{t("footer.privacyPolicy")}</Link>
            <Link href="#" className="text-xs text-primary-foreground/40 transition-colors hover:text-primary-foreground/60">{t("footer.termsOfService")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
