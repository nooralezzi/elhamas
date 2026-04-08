import { ServicesPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Our Services', ar: 'خدماتنا' },
    description: {
      en: 'Comprehensive support for your pilgrimage journey. Visas, hotel bookings, and transportation.',
      ar: 'دعم متكامل لرحلتك الإيمانية، يشمل التأشيرات وحجز الفنادق وخدمات النقل.',
    },
  })
}

export default function ServicesPage() {
  return <ServicesPageClient />
}
