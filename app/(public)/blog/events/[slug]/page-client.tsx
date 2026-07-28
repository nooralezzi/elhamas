'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft, Calendar, MapPin, Banknote, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError, fieldInvalidClass } from '@/components/ui/field-error'
import { useI18n, getLocalizedContent } from '@/lib/i18n'
import type { Event } from '@/lib/db'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  firstErrorMessage,
  hasErrors,
  setError,
  trimValue,
  digitsOnly,
  validateContactFields,
  validateInteger,
  validateMessage,
  handlePhoneInput,
  handleCountryCodeInput,
  handleLettersOnlyInput,
  handleIntegerInput,
  type FieldErrors,
} from '@/lib/form-validation'

interface EventDetailClientProps {
  event: Event
}

function formatDate(d: Date | null): string {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateRange(start: Date, end: Date | null): string {
  const s = formatDate(start)
  if (!end) return s
  const e = formatDate(end)
  if (s === e) return s
  return `${s} – ${e}`
}

export function EventDetailClient({ event: evt }: EventDetailClientProps) {
  const { t, locale, isRTL } = useI18n()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const title = getLocalizedContent(
    evt as unknown as Record<string, unknown>,
    'title',
    locale
  )
  const location = getLocalizedContent(
    evt as unknown as Record<string, unknown>,
    'location',
    locale
  )
  const frequency = getLocalizedContent(
    evt as unknown as Record<string, unknown>,
    'frequency',
    locale
  )
  const description = getLocalizedContent(
    evt as unknown as Record<string, unknown>,
    'description',
    locale
  )
  const dateDisplay = frequency || formatDateRange(evt.event_date, evt.end_date)
  const img = evt.featured_image || '/images/package-default.jpg'
  const priceStr = evt.price != null ? `${evt.price} ${evt.currency}` : null
  const audienceDisplay = evt.max_attendees == null || evt.max_attendees <= 0
    ? t('events.all')
    : String(evt.max_attendees)

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setFormError(null)
    setSubmitted(false)

    const form = e.currentTarget
    const formData = new FormData(form)
    const countryCode = trimValue(formData.get('countryCode')) || '+966'
    const phone = digitsOnly(trimValue(formData.get('phone')))
    const customerName = trimValue(formData.get('name'))
    const email = trimValue(formData.get('email'))
    const nationality = trimValue(formData.get('nationality'))
    const attendees = trimValue(formData.get('attendees'))
    const message = trimValue(formData.get('message'))
    const maxAttendees =
      evt.max_attendees != null && evt.max_attendees > 0 ? evt.max_attendees : 500

    const errors = validateContactFields(
      {
        name: customerName,
        email,
        phone: trimValue(formData.get('phone')),
        countryCode,
        nationality,
        phoneRequired: true,
      },
      locale,
    )
    setError(
      errors,
      'attendees',
      validateInteger(attendees, locale, { min: 1, max: maxAttendees }),
    )
    setError(errors, 'message', validateMessage(message, locale, false))

    if (hasErrors(errors)) {
      setFieldErrors(errors)
      setFormError(firstErrorMessage(errors, locale))
      return
    }

    setFieldErrors({})
    setLoading(true)

    const payload = {
      type: 'event',
      referenceId: evt.id,
      referenceName: title,
      referenceSummary: dateDisplay + (location ? ` • ${location}` : ''),
      meta: {
        eventDate: dateDisplay,
        location: location || undefined,
        maxAttendees: evt.max_attendees,
        attendees,
        price: evt.price,
        currency: evt.currency,
      },
      name: customerName,
      email,
      nationality: nationality || undefined,
      countryCode,
      phone: `${countryCode} ${phone}`,
      message: message || 'Event registration / inquiry',
      locale,
    }
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Request failed')
      }
      setSubmitted(true)
      form.reset()
    } catch (err) {
      console.error(err)
      setFormError(
        locale === 'ar'
          ? 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.'
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[260px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[380px] flex flex-col justify-end overflow-hidden pt-20 sm:pt-24">
        <Image
          src={img}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
        <div className="relative z-10 container mx-auto px-3 sm:px-4 pb-8 sm:pb-10 min-w-0">
          <Link href="/blog/events" className="inline-block mb-4 sm:mb-6">
            <Button variant="secondary" size="sm" className="gap-2">
              <ArrowLeft className={cn('h-4 w-4', locale === 'ar' && 'rotate-180')} />
              {t('events.backToEvents')}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg max-w-4xl break-words" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {title}
          </h1>
        </div>
      </section>

      {/* Main + sidebar */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-12 max-w-6xl min-w-0 overflow-x-hidden">
        <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8', locale === 'ar' && 'lg:grid-flow-dense')}>
          {/* Overview card - left, spans 2 cols on lg */}
          <div className={cn('lg:col-span-2 min-w-0', locale === 'ar' && 'lg:col-start-2')}>
            <div className="rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="bg-primary px-4 sm:px-6 py-2.5 sm:py-3">
                <h2 className="text-base sm:text-lg font-semibold text-white">{t('events.overview')}</h2>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                <div
                  className={cn(
                    'prose prose-lg max-w-none dark:prose-invert',
                    'prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary',
                    locale === 'ar' && 'prose-body:rtl'
                  )}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description || ''}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - right on lg */}
          <div className={cn('space-y-3 sm:space-y-4 min-w-0', locale === 'ar' && 'lg:col-start-1 lg:row-start-1')}>
            {/* Event Date card */}
            <div className="rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="bg-primary px-4 sm:px-6 py-2.5 sm:py-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white">{t('events.eventDate')}</h3>
              </div>
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="text-foreground font-medium text-sm sm:text-base truncate" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{dateDisplay}</span>
              </div>
            </div>

            {/* Price card */}
            <div className="rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="bg-primary px-4 sm:px-6 py-2.5 sm:py-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white">{t('events.price')}</h3>
              </div>
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0">
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <span className="text-foreground font-medium text-sm sm:text-base break-words">
                  {priceStr
                    ? `${t('events.fromPrice')} ${priceStr} / ${t('events.perPerson')}`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Information card */}
            <div className="rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="bg-primary px-4 sm:px-6 py-2.5 sm:py-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white">{t('events.information')}</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {location && (
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span className="text-foreground text-sm sm:text-base truncate" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span className="text-foreground text-sm sm:text-base">{t('events.audience')}: {audienceDisplay}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking & Inquiries form – full width, unified design */}
        <div className="mt-8 sm:mt-12 rounded-xl sm:rounded-2xl border border-border/60 bg-background shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-4 sm:p-6 md:p-8 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            {locale === 'ar' ? 'الحجز والاستفسارات' : 'Booking & Inquiries'}
          </h2>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
            {locale === 'ar'
              ? 'أدخل بياناتك للتسجيل أو الاستفسار عن هذه الفعالية.'
              : 'Enter your details to register or inquire about this event.'}
          </p>
          <form
            onSubmit={handleInquirySubmit}
            noValidate
            className={cn('space-y-4', isRTL && 'text-right')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evt-name" className="text-foreground">
                  {t('contact.form.name')}
                </Label>
                <Input
                  id="evt-name"
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  placeholder={t('contact.form.name')}
                  className={fieldInvalidClass(Boolean(fieldErrors.name))}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  onInput={handleLettersOnlyInput}
                />
                <FieldError message={fieldErrors.name} isRTL={isRTL} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-email" className="text-foreground">
                  {t('contact.form.email')}
                </Label>
                <Input
                  id="evt-email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  placeholder={t('contact.form.email')}
                  className={fieldInvalidClass(Boolean(fieldErrors.email))}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <FieldError message={fieldErrors.email} isRTL={isRTL} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-phone" className="text-foreground">
                {t('inquiry.form.phone')}
              </Label>
              <div
                className={cn(
                  'flex flex-col gap-3 sm:flex-row',
                  isRTL && 'sm:flex-row-reverse',
                )}
              >
                <Input
                  id="evt-countryCode"
                  name="countryCode"
                  type="tel"
                  required
                  defaultValue="+966"
                  inputMode="tel"
                  pattern="\+\d{1,4}"
                  maxLength={5}
                  placeholder="+966"
                  aria-invalid={Boolean(fieldErrors.countryCode)}
                  className={cn('w-full sm:w-28', fieldInvalidClass(Boolean(fieldErrors.countryCode)))}
                  dir="ltr"
                  onInput={handleCountryCodeInput}
                />
                <Input
                  id="evt-phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6,15}"
                  maxLength={15}
                  placeholder={t('inquiry.form.phone')}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  className={cn('flex-1', fieldInvalidClass(Boolean(fieldErrors.phone)))}
                  dir="ltr"
                  onInput={handlePhoneInput}
                />
              </div>
              <FieldError message={fieldErrors.countryCode || fieldErrors.phone} isRTL={isRTL} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evt-nationality" className="text-foreground">
                  {t('inquiry.form.nationality')}
                </Label>
                <Input
                  id="evt-nationality"
                  name="nationality"
                  maxLength={100}
                  aria-invalid={Boolean(fieldErrors.nationality)}
                  placeholder={t('inquiry.form.nationality')}
                  className={fieldInvalidClass(Boolean(fieldErrors.nationality))}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  onInput={handleLettersOnlyInput}
                />
                <FieldError message={fieldErrors.nationality} isRTL={isRTL} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-attendees" className="text-foreground">
                  {locale === 'ar' ? 'عدد الحضور (اختياري)' : 'Number of attendees (optional)'}
                </Label>
                <Input
                  id="evt-attendees"
                  name="attendees"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  aria-invalid={Boolean(fieldErrors.attendees)}
                  placeholder={locale === 'ar' ? 'مثال: 2' : 'e.g. 2'}
                  className={fieldInvalidClass(Boolean(fieldErrors.attendees))}
                  dir="ltr"
                  onInput={handleIntegerInput}
                />
                <FieldError message={fieldErrors.attendees} isRTL={isRTL} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-message" className="text-foreground">
                {t('contact.form.message')}
              </Label>
              <Textarea
                id="evt-message"
                name="message"
                rows={3}
                maxLength={5000}
                aria-invalid={Boolean(fieldErrors.message)}
                placeholder={t('contact.form.message')}
                className={fieldInvalidClass(Boolean(fieldErrors.message))}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <FieldError message={fieldErrors.message} isRTL={isRTL} />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {submitted && !error && (
              <p className="text-sm text-green-700 dark:text-green-400">
                {locale === 'ar' ? 'شكراً! تم إرسال طلبك.' : 'Thank you! Your request has been sent.'}
              </p>
            )}
            <div className={cn('pt-2', isRTL && 'text-right')}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-0 sm:min-w-[180px]"
              >
                {loading
                  ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                  : t('inquiry.form.send')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
