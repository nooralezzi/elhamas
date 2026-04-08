import { notFound } from 'next/navigation'
import { getHotelById } from '@/lib/db'
import { RoomBookingPageClient } from './page-client'
import { getRequestLocale } from '@/lib/locale'
import { getCommonKeywords, localizeField } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>
}) {
  const locale = await getRequestLocale()
  const { id, roomId } = await params
  const hotel = await getHotelById(id)
  const room = hotel?.rooms?.find((r) => r.id === roomId)
  if (!hotel || !room) {
    return {
      title: locale === 'ar' ? 'الغرفة غير موجودة' : 'Room Not Found',
      keywords: getCommonKeywords(),
    }
  }
  const roomTitle = localizeField(locale, room.name_en, room.name_ar, locale === 'ar' ? 'غرفة' : 'Room')
  const hotelTitle = localizeField(locale, hotel.name_en, hotel.name_ar, locale === 'ar' ? 'فندق' : 'Hotel')
  return {
    title: `${roomTitle} – ${hotelTitle}`,
    description: localizeField(
      locale,
      room.description_en || hotel.description_en,
      room.description_ar || hotel.description_ar,
    ),
    keywords: [
      room.name_en || 'Room',
      room.name_ar || 'غرفة',
      hotel.name_en || 'Hotel',
      hotel.name_ar || 'فندق',
      'Rooms',
      'الغرف',
      ...getCommonKeywords(),
    ],
  }
}

export default async function RoomBookingPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>
}) {
  const { id, roomId } = await params
  const hotel = await getHotelById(id)
  const room = hotel?.rooms?.find((r) => r.id === roomId)
  if (!hotel || !room) notFound()

  return <RoomBookingPageClient hotel={hotel} room={room} />
}

