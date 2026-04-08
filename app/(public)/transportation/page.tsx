import { getTransportation } from '@/lib/db'
import { TransportationPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Transportation Services', ar: 'خدمات النقل' },
    description: {
      en: 'Comfortable travel between holy sites. Browse vehicles and book your transfer.',
      ar: 'تنقل مريح بين المشاعر المقدسة. تصفح المركبات واحجز خدمتك.',
    },
  })
}

export default async function TransportationPage() {
  const items = await getTransportation()
  return <TransportationPageClient items={items} />
}
