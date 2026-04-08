import { getHotelLocations, getHotels } from '@/lib/db'
import { HotelsPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

// Force dynamic rendering so places added in admin appear immediately
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Premium Hotels', ar: 'الفنادق الفاخرة' },
    description: {
      en: 'Comfortable stays near the holy sites. Browse by location and find the best accommodation.',
      ar: 'إقامة مريحة بالقرب من المشاعر المقدسة. تصفح حسب الموقع واختر أفضل فندق.',
    },
  })
}

export default async function HotelsPage() {
  const [locations, hotels] = await Promise.all([
    getHotelLocations(),
    getHotels(),
  ])
  return (
    <HotelsPageClient
      locations={locations}
      hotels={hotels}
    />
  )
}
