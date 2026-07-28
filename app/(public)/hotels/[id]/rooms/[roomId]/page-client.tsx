'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  Star,
  Check,
  Bed,
  Wifi,
  Snowflake,
  Tv,
  Refrigerator,
  User,
} from 'lucide-react'
import { useI18n, getLocalizedContent } from '@/lib/i18n'
import type { Hotel, Room } from '@/lib/db'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FieldError, fieldInvalidClass } from '@/components/ui/field-error'
import {
  firstErrorMessage,
  hasErrors,
  setError,
  trimValue,
  digitsOnly,
  validateContactFields,
  validateDate,
  validateDateOrder,
  validateInteger,
  validateMessage,
  validateYesNo,
  validationMessage,
  handlePhoneInput,
  handleCountryCodeInput,
  handleLettersOnlyInput,
  handleIntegerInput,
  type FieldErrors,
} from '@/lib/form-validation'

function amenityIcon(amenity: string) {
  const a = amenity.toLowerCase()
  if (a.includes('wifi') || a.includes('wi-fi')) return Wifi
  if (a.includes('air') || a.includes('ac') || a.includes('conditioning'))
    return Snowflake
  if (a.includes('tv') || a.includes('television')) return Tv
  if (
    a.includes('fridge') ||
    a.includes('minibar') ||
    a.includes('refrigerator')
  )
    return Refrigerator
  if (a.includes('bed') || a.includes('beds')) return Bed
  return Check
}

interface RoomBookingPageClientProps {
  hotel: Hotel
  room: Room
}

export function RoomBookingPageClient({ hotel, room }: RoomBookingPageClientProps) {
  const { t, locale, isRTL } = useI18n()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [todayIso, setTodayIso] = useState<string | undefined>()

  useEffect(() => {
    const now = new Date()
    const localMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
    setTodayIso(localMidnight.toISOString().slice(0, 10))
  }, [])

  const hotelName = getLocalizedContent(
    hotel as unknown as Record<string, unknown>,
    'name',
    locale,
  )
  const roomName = getLocalizedContent(
    room as unknown as Record<string, unknown>,
    'name',
    locale,
  )
  const roomDescription = getLocalizedContent(
    room as unknown as Record<string, unknown>,
    'description',
    locale,
  )
  const heroImage =
    room.image_url ||
    (hotel.images?.length ? hotel.images[0] : '/images/package-default.jpg')
  const amenitiesEn = room.amenities ?? []
  const amenitiesAr = room.amenities_ar ?? []
  const amenities = amenitiesEn
    .map((_, i) =>
      locale === 'ar' && amenitiesAr[i] ? amenitiesAr[i] : amenitiesEn[i],
    )
    .filter(Boolean)
  const fitsLabel =
    room.max_guests === 1
      ? (locale === 'ar' ? 'لشخص واحد' : 'Fits 1 person')
      : locale === 'ar'
        ? `لـ ${room.max_guests} أشخاص`
        : `Fits ${room.max_guests} persons`

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setFormError(null)
    setSubmitted(false)

    const form = e.currentTarget
    const formData = new FormData(form)

    const checkIn = trimValue(formData.get('checkIn'))
    const checkOut = trimValue(formData.get('checkOut'))
    const adults = trimValue(formData.get('adults'))
    const children = trimValue(formData.get('children'))
    const countryCode = trimValue(formData.get('countryCode')) || '+966'
    const phone = digitsOnly(trimValue(formData.get('phone')))
    const customerName = trimValue(formData.get('name'))
    const email = trimValue(formData.get('email'))
    const nationality = trimValue(formData.get('nationality'))
    const message = trimValue(formData.get('message'))
    const needVisa = trimValue(formData.get('needVisa'))
    const bookedFlight = trimValue(formData.get('bookedFlight'))
    const needTransport = trimValue(formData.get('needTransport'))
    const maxGuests = room.max_guests || 10

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
    setError(errors, 'checkIn', validateDate(checkIn, locale, { required: true }))
    setError(errors, 'checkOut', validateDate(checkOut, locale, { required: true }))
    setError(errors, 'checkOut', errors.checkOut || validateDateOrder(checkIn, checkOut, locale))
    setError(errors, 'adults', validateInteger(adults, locale, { required: true, min: 1, max: maxGuests }))
    setError(errors, 'children', validateInteger(children, locale, { min: 0, max: maxGuests }))
    setError(errors, 'message', validateMessage(message, locale, false))
    setError(errors, 'needVisa', validateYesNo(needVisa, locale))
    setError(errors, 'bookedFlight', validateYesNo(bookedFlight, locale))
    setError(errors, 'needTransport', validateYesNo(needTransport, locale))

    const adultsN = Number(adults || 0)
    const childrenN = Number(children || 0)
    if (
      Number.isFinite(adultsN) &&
      Number.isFinite(childrenN) &&
      adultsN + childrenN > maxGuests
    ) {
      setError(errors, 'adults', validationMessage('guestsOverCapacity', locale))
    }

    if (hasErrors(errors)) {
      setFieldErrors(errors)
      setFormError(firstErrorMessage(errors, locale))
      return
    }

    setFieldErrors({})
    setLoading(true)

    const payload = {
      type: 'hotel_room',
      referenceId: room.id,
      referenceName: roomName,
      referenceSummary: `${hotelName} • ${roomName}`,
      meta: {
        hotelName,
        roomName,
        pricePerNight: room.price_per_night,
        currency: room.currency,
        maxGuests: room.max_guests,
        checkIn,
        checkOut,
        adults,
        children,
        needVisa,
        bookedFlight,
        needTransport,
      },
      name: customerName,
      email,
      nationality: nationality || undefined,
      countryCode,
      phone: `${countryCode} ${phone}`,
      travelers: adults,
      message:
        message ||
        `Check-in: ${checkIn}, Check-out: ${checkOut}, Adults: ${adults}, Children: ${children || 0}`,
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
          ? 'حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى لاحقاً.'
          : 'Something went wrong while sending your request. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero: room name + hotel name */}
      <section className="relative min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[340px] flex flex-col justify-center overflow-hidden pt-20 sm:pt-24">
        <Image
          src={heroImage}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/75 to-primary/90"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center max-w-4xl min-w-0">
          <p className="text-white/90 text-xs sm:text-sm md:text-base mb-1 drop-shadow-md truncate max-w-full">
            {hotelName}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg break-words">
            {roomName}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              {hotel.star_rating} {t('hotels.starRating')}
            </span>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <div className="relative z-20 -mt-4 sm:-mt-6 px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-6xl min-w-0">
          <div
            className={cn(
              'rounded-xl sm:rounded-2xl bg-white border border-border shadow-lg px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center justify-center md:justify-between gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm',
              isRTL && 'md:flex-row-reverse',
            )}
          >
            <span className="font-semibold text-foreground">{roomName}</span>
            <span className="text-muted-foreground">
              {room.currency} {room.price_per_night.toLocaleString()}{' '}
              {t('common.perNight')}
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-primary shrink-0" />
              {fitsLabel}
            </span>
          </div>
        </div>
      </div>

      <section className="py-8 sm:py-12 md:py-16 overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl min-w-0">
          <div
            className={cn(
              'mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground',
              isRTL && 'flex-row-reverse text-right',
            )}
          >
            <Link
              href={`/hotels/${hotel.id}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ChevronLeft
                className={cn('w-4 h-4 shrink-0', isRTL && 'rotate-180')}
              />
              {locale === 'ar' ? 'العودة للفندق' : 'Back to hotel'}
            </Link>
            <span className="text-xs uppercase tracking-wide font-medium">
              {locale === 'ar' ? 'حجز غرفة' : 'Room booking'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
            {/* Left: room details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
              <div className="rounded-xl border border-border bg-card overflow-hidden min-w-0">
                <div className="relative w-full aspect-[4/3] bg-muted">
                  {room.image_url ? (
                    <Image
                      src={room.image_url}
                      alt={roomName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #751f27 0%, #4a1c20 100%)',
                      }}
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    {roomName}
                  </h2>
                  {roomDescription && (
                    <p
                      className="text-sm text-muted-foreground leading-relaxed mb-4"
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {roomDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-foreground mb-4">
                    <span className="text-lg font-bold text-primary">
                      {room.currency} {room.price_per_night.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {t('common.perNight')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    {fitsLabel}
                  </div>
                </div>
              </div>
              {amenities.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {t('hotels.amenities')}
                  </h3>
                  <ul
                    className="space-y-2"
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {amenities.map((a, i) => {
                      const Icon = amenityIcon(a)
                      return (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span>{a}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: booking form */}
            <div className="lg:col-span-3 min-w-0">
              <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-background shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {locale === 'ar' ? 'الحجز والاستفسارات' : 'Booking & Inquiries'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  {locale === 'ar'
                    ? 'اختر التواريخ وأدخل بياناتك لإرسال طلب الحجز لهذه الغرفة.'
                    : 'Select your dates and enter your details to request a booking for this room.'}
                </p>

                <form
            onSubmit={handleSubmit}
            noValidate
            className={cn('space-y-4', isRTL && 'text-right')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">
                  {locale === 'ar' ? 'تاريخ الوصول' : 'Check-in date'}
                </Label>
                <Input
                  id="checkIn"
                  name="checkIn"
                  type="date"
                  required
                  min={todayIso}
                  aria-invalid={Boolean(fieldErrors.checkIn)}
                  className={fieldInvalidClass(Boolean(fieldErrors.checkIn))}
                  dir="ltr"
                />
                <FieldError message={fieldErrors.checkIn} isRTL={isRTL} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">
                  {locale === 'ar' ? 'تاريخ المغادرة' : 'Check-out date'}
                </Label>
                <Input
                  id="checkOut"
                  name="checkOut"
                  type="date"
                  required
                  min={todayIso}
                  aria-invalid={Boolean(fieldErrors.checkOut)}
                  className={fieldInvalidClass(Boolean(fieldErrors.checkOut))}
                  dir="ltr"
                />
                <FieldError message={fieldErrors.checkOut} isRTL={isRTL} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">
                  {locale === 'ar' ? 'عدد البالغين' : 'Adults'}
                </Label>
                <Input
                  id="adults"
                  name="adults"
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  defaultValue={String(Math.min(2, room.max_guests || 2))}
                  aria-invalid={Boolean(fieldErrors.adults)}
                  className={fieldInvalidClass(Boolean(fieldErrors.adults))}
                  dir="ltr"
                  onInput={handleIntegerInput}
                />
                <FieldError message={fieldErrors.adults} isRTL={isRTL} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">
                  {locale === 'ar' ? 'عدد الأطفال' : 'Children'}
                </Label>
                <Input
                  id="children"
                  name="children"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  aria-invalid={Boolean(fieldErrors.children)}
                  className={fieldInvalidClass(Boolean(fieldErrors.children))}
                  dir="ltr"
                  onInput={handleIntegerInput}
                />
                <FieldError message={fieldErrors.children} isRTL={isRTL} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">
                  {locale === 'ar' ? 'الجنسية' : 'Nationality'}
                </Label>
                <Input
                  id="nationality"
                  name="nationality"
                  maxLength={100}
                  aria-invalid={Boolean(fieldErrors.nationality)}
                  placeholder={locale === 'ar' ? 'الجنسية' : 'Nationality'}
                  className={fieldInvalidClass(Boolean(fieldErrors.nationality))}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  onInput={handleLettersOnlyInput}
                />
                <FieldError message={fieldErrors.nationality} isRTL={isRTL} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  {t('contact.form.name')}
                </Label>
                <Input
                  id="name"
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
                <Label htmlFor="email" className="text-foreground">
                  {t('contact.form.email')}
                </Label>
                <Input
                  id="email"
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
              <Label htmlFor="phone" className="text-foreground">
                {locale === 'ar' ? 'رقم الهاتف' : 'Phone'}
              </Label>
              <div
                className={cn(
                  'flex flex-col gap-3 sm:flex-row',
                  isRTL && 'sm:flex-row-reverse',
                )}
              >
                <Input
                  id="countryCode"
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
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6,15}"
                  maxLength={15}
                  placeholder={locale === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  className={cn('flex-1', fieldInvalidClass(Boolean(fieldErrors.phone)))}
                  dir="ltr"
                  onInput={handlePhoneInput}
                />
              </div>
              <FieldError message={fieldErrors.countryCode || fieldErrors.phone} isRTL={isRTL} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">
                {locale === 'ar' ? 'ملاحظات خاصة (اختياري)' : 'Special requests (optional)'}
              </Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                maxLength={5000}
                aria-invalid={Boolean(fieldErrors.message)}
                placeholder={
                  locale === 'ar'
                    ? 'أخبرنا بأي ملاحظات إضافية حول مواعيد الوصول أو نوع الأسرّة وغيرها.'
                    : 'Tell us any additional details such as arrival time or bed preferences.'
                }
                className={fieldInvalidClass(Boolean(fieldErrors.message))}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <FieldError message={fieldErrors.message} isRTL={isRTL} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {t('booking.needVisa')} <span className="text-destructive">*</span>
                </p>
                <div
                  className={cn(
                    'flex flex-col gap-2 text-sm text-foreground',
                    isRTL && 'items-end text-right',
                  )}
                >
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="needVisa"
                      value="yes"
                      className="h-4 w-4 border border-border rounded-full text-primary focus:ring-primary"
                    />
                    <span>{t('booking.yes')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="needVisa"
                      value="no"
                      className="h-4 w-4 border border-border rounded-full text-primary focus:ring-primary"
                    />
                    <span>{t('booking.no')}</span>
                  </label>
                </div>
                <FieldError message={fieldErrors.needVisa} isRTL={isRTL} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {t('booking.bookedFlight')} <span className="text-destructive">*</span>
                </p>
                <div
                  className={cn(
                    'flex flex-col gap-2 text-sm text-foreground',
                    isRTL && 'items-end text-right',
                  )}
                >
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="bookedFlight"
                      value="yes"
                      className="h-4 w-4 border border-border rounded-full text-primary focus:ring-primary"
                    />
                    <span>{t('booking.yes')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="bookedFlight"
                      value="no"
                      className="h-4 w-4 border border-border rounded-full text-primary focus:ring-primary"
                    />
                    <span>{t('booking.no')}</span>
                  </label>
                </div>
                <FieldError message={fieldErrors.bookedFlight} isRTL={isRTL} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {t('booking.needTransport')} <span className="text-destructive">*</span>
                </p>
                <div
                  className={cn(
                    'flex flex-col gap-2 text-sm text-foreground',
                    isRTL && 'items-end text-right',
                  )}
                >
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="needTransport"
                      value="yes"
                      className="h-4 w-4 border border-border rounded-full text-primary focus:ring-primary"
                    />
                    <span>{t('booking.yes')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="needTransport"
                      value="no"
                      className="h-4 w-4 border border-border rounded-full text-primary focus:ring-primary"
                    />
                    <span>{t('booking.no')}</span>
                  </label>
                </div>
                <FieldError message={fieldErrors.needTransport} isRTL={isRTL} />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {submitted && !error && (
              <p className="text-sm text-green-700 dark:text-green-400">
                {locale === 'ar'
                  ? 'شكراً لك! تم استلام طلب الحجز وسنتواصل معك قريباً.'
                  : 'Thank you! Your booking request has been received and we will contact you soon.'}
              </p>
            )}

            <div className={cn('pt-2', isRTL && 'text-right')}>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[180px]"
              >
                {loading
                  ? locale === 'ar'
                    ? 'جاري الإرسال...'
                    : 'Sending...'
                  : locale === 'ar'
                    ? 'إرسال طلب الحجز'
                    : 'Send booking request'}
              </Button>
            </div>
          </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

