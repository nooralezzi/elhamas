import { notFound } from 'next/navigation'
import { getTourPackageById } from '@/lib/db'
import { PackageDetailClient } from './page-client'
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
  const pkg = await getTourPackageById(id)
  if (!pkg) {
    return {
      title: locale === 'ar' ? 'الباقة غير موجودة' : 'Package Not Found',
      keywords: getCommonKeywords(),
    }
  }
  return {
    title: localizeField(locale, pkg.name_en, pkg.name_ar, locale === 'ar' ? 'باقة سفر' : 'Tour Package'),
    description: localizeField(
      locale,
      pkg.short_description_en || pkg.description_en,
      pkg.short_description_ar || pkg.description_ar,
    ),
    keywords: [
      pkg.name_en || 'Tour Package',
      pkg.name_ar || 'باقة سفر',
      'Tour Packages',
      'باقات السفر',
      ...getCommonKeywords(),
    ],
  }
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pkg = await getTourPackageById(id)
  if (!pkg) notFound()
  return <PackageDetailClient package={pkg} />
}
