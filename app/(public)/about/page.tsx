import { getTestimonials } from '@/lib/db'
import { AboutPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'About Us', ar: 'من نحن' },
    description: {
      en: 'Your trusted partner for sacred journeys.',
      ar: 'شريكك الموثوق للرحلات المقدسة.',
    },
  })
}

export default async function AboutPage() {
  const testimonials = await getTestimonials()
  return <AboutPageClient testimonials={testimonials} />
}
