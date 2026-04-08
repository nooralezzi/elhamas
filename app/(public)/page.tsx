import { getHotels, getTourPackages, getTestimonials, getBlogPosts } from '@/lib/db'
import { HomePageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Home', ar: 'الرئيسية' },
    description: {
      en: 'Premium Hajj and Umrah services, curated packages, trusted guidance, and seamless planning.',
      ar: 'خدمات متميزة للحج والعمرة تشمل باقات مختارة وإرشاد موثوق وتخطيط متكامل.',
    },
  })
}

export default async function HomePage() {
  const [hotels, packages, testimonials, blogPosts] = await Promise.all([
    getHotels(true),
    getTourPackages(true),
    getTestimonials(),
    getBlogPosts(3),
  ])

  return (
    <HomePageClient
      hotels={hotels}
      packages={packages}
      testimonials={testimonials}
      blogPosts={blogPosts}
    />
  )
}
