import { notFound } from 'next/navigation'
import { getHotelById } from '@/lib/db'
import { HotelDetailClient } from './page-client'
import { getRequestLocale } from '@/lib/locale'
import { getCommonKeywords, localizeField } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const locale = await getRequestLocale()
  const { id } = await params
  const hotel = await getHotelById(id)
  if (!hotel) {
    return {
      title: locale === 'ar' ? 'الفندق غير موجود' : 'Hotel Not Found',
      keywords: getCommonKeywords(),
    }
  }
  return {
    title: localizeField(locale, hotel.name_en, hotel.name_ar, locale === 'ar' ? 'فندق' : 'Hotel'),
    description: localizeField(locale, hotel.description_en, hotel.description_ar),
    keywords: [
      hotel.name_en || 'Hotel',
      hotel.name_ar || 'فندق',
      'Hotels',
      'الفنادق',
      ...getCommonKeywords(),
    ],
  }
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const hotel = await getHotelById(id)
  if (!hotel) notFound()
  return <HotelDetailClient hotel={hotel} />
}
