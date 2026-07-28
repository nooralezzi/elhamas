'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError, fieldInvalidClass } from '@/components/ui/field-error'
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

interface InquiryFormSectionProps {
  contextType: string
  referenceId: string
  referenceName: string
  referenceSummary?: string
  /** Extra metadata that will be sent in the email (e.g. price, validity) */
  meta?: Record<string, string | number | null | undefined>
}

export function InquiryFormSection({
  contextType,
  referenceId,
  referenceName,
  referenceSummary,
  meta,
}: InquiryFormSectionProps) {
  const { t, isRTL, locale } = useI18n()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setFormError(null)
    setSubmitted(false)

    const formElement = e.currentTarget
    const formData = new FormData(formElement)
    const countryCode = trimValue(formData.get('countryCode')) || '+966'
    const phone = digitsOnly(trimValue(formData.get('phone')))
    const name = trimValue(formData.get('name'))
    const email = trimValue(formData.get('email'))
    const nationality = trimValue(formData.get('nationality'))
    const travelers = trimValue(formData.get('travelers'))
    const message = trimValue(formData.get('message'))

    const errors = validateContactFields(
      {
        name,
        email,
        phone: trimValue(formData.get('phone')),
        countryCode,
        nationality,
        phoneRequired: true,
      },
      locale,
    )
    setError(errors, 'travelers', validateInteger(travelers, locale, { min: 1, max: 100 }))
    setError(errors, 'message', validateMessage(message, locale))

    if (hasErrors(errors)) {
      setFieldErrors(errors)
      setFormError(firstErrorMessage(errors, locale))
      return
    }

    setFieldErrors({})
    setLoading(true)

    const payload = {
      type: contextType,
      referenceId,
      referenceName,
      referenceSummary,
      meta: meta ?? {},
      name,
      email,
      nationality: nationality || undefined,
      countryCode,
      phone: `${countryCode} ${phone}`,
      travelers: travelers || undefined,
      message,
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
      formElement.reset()
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
    <section className="py-12 md:py-16 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-background shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-6 sm:p-8">
            <div
              className={cn(
                'mb-6 sm:mb-8 flex flex-col gap-1',
                isRTL && 'text-right',
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-primary/80">
                {referenceSummary}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {referenceName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === 'ar'
                  ? 'املأ بياناتك وسيتواصل معك فريقنا لتأكيد التفاصيل وإكمال الإجراءات.'
                  : 'Fill in your details and our team will contact you to confirm and complete the process.'}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className={cn('space-y-4', isRTL && 'text-right')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inq-name" className="text-foreground">
                    {t('contact.form.name')}
                  </Label>
                  <Input
                    id="inq-name"
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
                  <Label htmlFor="inq-email" className="text-foreground">
                    {t('contact.form.email')}
                  </Label>
                  <Input
                    id="inq-email"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inq-nationality" className="text-foreground">
                    {t('inquiry.form.nationality')}
                  </Label>
                  <Input
                    id="inq-nationality"
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
                  <Label htmlFor="inq-travelers" className="text-foreground">
                    {locale === 'ar'
                      ? 'عدد المسافرين (اختياري)'
                      : 'Number of travelers (optional)'}
                  </Label>
                  <Input
                    id="inq-travelers"
                    name="travelers"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    aria-invalid={Boolean(fieldErrors.travelers)}
                    placeholder={locale === 'ar' ? 'مثال: 3' : 'e.g. 3'}
                    className={fieldInvalidClass(Boolean(fieldErrors.travelers))}
                    dir="ltr"
                    onInput={handleIntegerInput}
                  />
                  <FieldError message={fieldErrors.travelers} isRTL={isRTL} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inq-phone" className="text-foreground">
                  {t('inquiry.form.phone')}
                </Label>
                <div
                  className={cn(
                    'flex flex-col gap-3 sm:flex-row',
                    isRTL && 'sm:flex-row-reverse',
                  )}
                >
                  <Input
                    id="inq-countryCode"
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
                    id="inq-phone"
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

              <div className="space-y-2">
                <Label htmlFor="inq-message" className="text-foreground">
                  {t('contact.form.message')}
                </Label>
                <Textarea
                  id="inq-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  aria-invalid={Boolean(fieldErrors.message)}
                  placeholder={
                    locale === 'ar'
                      ? 'أخبرنا بالمواعيد المفضلة وأي ملاحظات إضافية.'
                      : 'Tell us about your preferred dates and any additional details.'
                  }
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
                  {locale === 'ar'
                    ? 'شكراً لك! تم استلام طلبك وسنتواصل معك قريباً.'
                    : 'Thank you! Your request has been received and we will contact you soon.'}
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
                      ? 'إرسال الطلب'
                      : 'Send request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
