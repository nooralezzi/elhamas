import { notFound } from 'next/navigation'
import { getTransportationById } from '@/lib/db'
import { TransportationDetailClient } from './page-client'
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
  const item = await getTransportationById(id)
  if (!item) {
    return {
      title: locale === 'ar' ? 'خدمة النقل غير موجودة' : 'Transportation Not Found',
      keywords: getCommonKeywords(),
    }
  }
  return {
    title: localizeField(locale, item.name_en, item.name_ar, locale === 'ar' ? 'خدمة نقل' : 'Transportation'),
    description: localizeField(locale, item.description_en, item.description_ar),
    keywords: [
      item.name_en || 'Transportation',
      item.name_ar || 'خدمة نقل',
      'Transportation',
      'النقل',
      ...getCommonKeywords(),
    ],
  }
}

export default async function TransportationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await getTransportationById(id)
  if (!item) notFound()
  return <TransportationDetailClient item={item} />
}
