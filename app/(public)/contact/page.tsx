import ContactPageClient from './page-client'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/lib/locale'
import { createPageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return createPageMetadata(locale, {
    title: { en: 'Contact Us', ar: 'تواصل معنا' },
    description: {
      en: 'We are here to assist you.',
      ar: 'نحن هنا لمساعدتك.',
    },
  })
}

export default function ContactPage() {
  return <ContactPageClient />
}
