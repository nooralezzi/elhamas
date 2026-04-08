import { getEvents } from '@/lib/db'
import { EventsPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Events', ar: 'الفعاليات' },
    description: {
      en: 'Upcoming events and activities.',
      ar: 'الفعاليات والأنشطة القادمة.',
    },
  })
}

export default async function EventsPage() {
  const events = await getEvents()
  return <EventsPageClient events={events} />
}
