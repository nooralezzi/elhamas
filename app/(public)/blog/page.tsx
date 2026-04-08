import { BlogPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Our Blog', ar: 'المدونة' },
    description: {
      en: 'Articles and tips for your journey.',
      ar: 'مقالات ونصائح مفيدة لرحلتك.',
    },
  })
}

export default function BlogPage() {
  return <BlogPageClient />
}
