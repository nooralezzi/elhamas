import { getBlogPosts } from '@/lib/db'
import { ArticlesPageClient } from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Articles', ar: 'المقالات' },
    description: {
      en: 'Browse all articles and travel tips.',
      ar: 'تصفح جميع المقالات ونصائح السفر.',
    },
  })
}

export default async function ArticlesPage() {
  const articles = await getBlogPosts()
  return <ArticlesPageClient articles={articles} />
}
