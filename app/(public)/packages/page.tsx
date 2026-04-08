import { getTourPackages, getPackageCategories, getLocations, getPackageDiscoverCard } from '@/lib/db'
import { PackagesPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

// Force dynamic rendering so categories/locations added in admin appear immediately in production
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Tour Packages', ar: 'باقات السفر' },
    description: {
      en: 'Explore our comprehensive Hajj and Umrah packages designed for a meaningful spiritual journey.',
      ar: 'اكتشف باقات حج وعمرة متكاملة مصممة لرحلة روحانية مميزة.',
    },
  })
}

export default async function PackagesPage() {
  const [packages, categories, locations, discoverCard] = await Promise.all([
    getTourPackages(),
    getPackageCategories(),
    getLocations(),
    getPackageDiscoverCard(),
  ])
  return (
    <PackagesPageClient
      packages={packages}
      categories={categories}
      locations={locations}
      discoverCard={discoverCard}
    />
  )
}
