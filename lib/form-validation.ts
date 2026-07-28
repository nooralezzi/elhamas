export type ValidationLocale = 'en' | 'ar'

export type FieldErrors = Record<string, string>

/** Stricter email: local@domain.tld */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

/** Phone local number: digits only, 6–15 */
const PHONE_DIGITS_RE = /^\d{6,15}$/

/** Country code like +966 */
const COUNTRY_CODE_RE = /^\+\d{1,4}$/

/** Letters (any language), spaces, apostrophes, hyphens — no digits/symbols */
const NAME_RE = /^(?=.{2,100}$)[\p{L}\p{M}]+(?:[\s'.-]+[\p{L}\p{M}]+)*\.?$/u

/** Nationality: letters and spaces only */
const NATIONALITY_RE = /^(?=.{2,100}$)[\p{L}\p{M}]+(?:\s+[\p{L}\p{M}]+)*$/u

const messages = {
  en: {
    required: 'This field is required.',
    name: 'Name must contain letters only (no numbers or special characters).',
    email: 'Enter a valid email format (e.g. name@example.com).',
    phone: 'Phone number must contain digits only (6–15 numbers).',
    phoneFormat: 'Phone number must contain numbers only — no letters or symbols.',
    countryCode: 'Country code must start with + followed by 1–4 digits (e.g. +966).',
    subject: 'Subject must be at least 3 characters.',
    message: 'Message must be at least 10 characters.',
    nationality: 'Nationality must contain letters only (no numbers).',
    positiveInt: 'This field must be a whole number.',
    minValue: 'Value is too small.',
    maxValue: 'Value is too large.',
    date: 'Enter a valid date.',
    datePast: 'Date cannot be in the past.',
    dateOrder: 'Check-out must be after check-in.',
    yesNo: 'Please select Yes or No.',
    guestsOverCapacity: 'Guests exceed the room capacity.',
    formInvalid: 'Please fix the highlighted fields and try again.',
  },
  ar: {
    required: 'هذا الحقل مطلوب.',
    name: 'يجب أن يحتوي الاسم على أحرف فقط (بدون أرقام أو رموز).',
    email: 'أدخل بريداً إلكترونياً بالصيغة الصحيحة (مثل name@example.com).',
    phone: 'رقم الهاتف يجب أن يكون أرقاماً فقط (6–15 رقماً).',
    phoneFormat: 'رقم الهاتف يجب أن يحتوي على أرقام فقط — بدون أحرف أو رموز.',
    countryCode: 'رمز الدولة يجب أن يبدأ بـ + متبوعاً بـ 1–4 أرقام (مثل +966).',
    subject: 'يجب أن يكون الموضوع 3 أحرف على الأقل.',
    message: 'يجب أن تكون الرسالة 10 أحرف على الأقل.',
    nationality: 'الجنسية يجب أن تحتوي على أحرف فقط (بدون أرقام).',
    positiveInt: 'يجب أن يكون هذا الحقل رقماً صحيحاً.',
    minValue: 'القيمة صغيرة جداً.',
    maxValue: 'القيمة كبيرة جداً.',
    date: 'أدخل تاريخاً صالحاً.',
    datePast: 'لا يمكن أن يكون التاريخ في الماضي.',
    dateOrder: 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول.',
    yesNo: 'يرجى اختيار نعم أو لا.',
    guestsOverCapacity: 'عدد الضيوف يتجاوز سعة الغرفة.',
    formInvalid: 'يرجى تصحيح الحقول المحددة والمحاولة مرة أخرى.',
  },
} as const

export type ValidationMessageKey = keyof typeof messages.en

export function validationMessage(
  key: ValidationMessageKey,
  locale: ValidationLocale = 'en',
): string {
  return messages[locale][key] ?? messages.en[key]
}

export function trimValue(value: FormDataEntryValue | string | null | undefined): string {
  if (value == null) return ''
  return String(value).trim()
}

/** Keep digits only (for phone local number). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Normalize country code to +digits. */
export function normalizeCountryCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits ? `+${digits}` : '+'
}

function todayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function validateName(
  value: string,
  locale: ValidationLocale,
  required = true,
): string | null {
  const v = value.trim().replace(/\s+/g, ' ')
  if (!v) return required ? validationMessage('required', locale) : null
  if (/\d/.test(v) || !NAME_RE.test(v)) {
    return validationMessage('name', locale)
  }
  return null
}

export function validateEmail(
  value: string,
  locale: ValidationLocale,
  required = true,
): string | null {
  const v = value.trim()
  if (!v) return required ? validationMessage('required', locale) : null
  if (v.length > 255 || /\s/.test(v) || !EMAIL_RE.test(v)) {
    return validationMessage('email', locale)
  }
  return null
}

export function validateCountryCode(
  value: string,
  locale: ValidationLocale,
  required = false,
): string | null {
  const v = value.trim()
  if (!v) return required ? validationMessage('required', locale) : null
  if (!COUNTRY_CODE_RE.test(v)) {
    return validationMessage('countryCode', locale)
  }
  return null
}

export function validatePhone(
  value: string,
  locale: ValidationLocale,
  required = true,
): string | null {
  const v = value.trim()
  if (!v) return required ? validationMessage('required', locale) : null

  // Reject any letters or symbols immediately
  if (/[^\d]/.test(v)) {
    return validationMessage('phoneFormat', locale)
  }

  if (!PHONE_DIGITS_RE.test(v)) {
    return validationMessage('phone', locale)
  }
  return null
}

export function validateSubject(
  value: string,
  locale: ValidationLocale,
  required = true,
): string | null {
  const v = value.trim()
  if (!v) return required ? validationMessage('required', locale) : null
  if (v.length < 3 || v.length > 255) {
    return validationMessage('subject', locale)
  }
  return null
}

export function validateMessage(
  value: string,
  locale: ValidationLocale,
  required = true,
  minLength = 10,
): string | null {
  const v = value.trim()
  if (!v) return required ? validationMessage('required', locale) : null
  if (v.length < minLength || v.length > 5000) {
    return validationMessage('message', locale)
  }
  return null
}

export function validateNationality(
  value: string,
  locale: ValidationLocale,
  required = false,
): string | null {
  const v = value.trim().replace(/\s+/g, ' ')
  if (!v) return required ? validationMessage('required', locale) : null
  if (/\d/.test(v) || !NATIONALITY_RE.test(v)) {
    return validationMessage('nationality', locale)
  }
  return null
}

export function validateOptionalText(
  value: string,
  locale: ValidationLocale,
  maxLength = 255,
): string | null {
  const v = value.trim()
  if (!v) return null
  if (v.length > maxLength) {
    return validationMessage('maxValue', locale)
  }
  return null
}

export function validateInteger(
  value: string,
  locale: ValidationLocale,
  opts: { required?: boolean; min?: number; max?: number } = {},
): string | null {
  const { required = false, min = 0, max = 999 } = opts
  const v = value.trim()
  if (!v) return required ? validationMessage('required', locale) : null
  // Must be digits only — no decimals, letters, or signs
  if (!/^\d+$/.test(v)) return validationMessage('positiveInt', locale)
  const n = Number(v)
  if (!Number.isInteger(n)) return validationMessage('positiveInt', locale)
  if (n < min) return validationMessage('minValue', locale)
  if (n > max) return validationMessage('maxValue', locale)
  return null
}

export function validateDate(
  value: string,
  locale: ValidationLocale,
  opts: { required?: boolean; allowPast?: boolean } = {},
): string | null {
  const { required = true, allowPast = false } = opts
  const v = value.trim()
  if (!v) return required ? validationMessage('required', locale) : null
  const d = parseDateOnly(v)
  if (!d) return validationMessage('date', locale)
  if (!allowPast && d < todayStart()) {
    return validationMessage('datePast', locale)
  }
  return null
}

export function validateDateOrder(
  checkIn: string,
  checkOut: string,
  locale: ValidationLocale,
): string | null {
  const inDate = parseDateOnly(checkIn.trim())
  const outDate = parseDateOnly(checkOut.trim())
  if (!inDate || !outDate) return null
  if (outDate <= inDate) return validationMessage('dateOrder', locale)
  return null
}

export function validateYesNo(
  value: string,
  locale: ValidationLocale,
  required = true,
): string | null {
  const v = value.trim().toLowerCase()
  if (!v) return required ? validationMessage('yesNo', locale) : null
  if (v !== 'yes' && v !== 'no') return validationMessage('yesNo', locale)
  return null
}

export function setError(
  errors: FieldErrors,
  field: string,
  message: string | null,
): void {
  if (message) errors[field] = message
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function firstErrorMessage(
  errors: FieldErrors,
  locale: ValidationLocale,
): string {
  const first = Object.values(errors)[0]
  return first || validationMessage('formInvalid', locale)
}

/** Shared contact/customer fields used by every inquiry form. */
export function validateContactFields(
  input: {
    name: string
    email: string
    phone?: string
    countryCode?: string
    nationality?: string
    phoneRequired?: boolean
    nationalityRequired?: boolean
  },
  locale: ValidationLocale,
): FieldErrors {
  const errors: FieldErrors = {}
  const phoneRequired = input.phoneRequired ?? true
  const phone = digitsOnly(trimValue(input.phone))
  const countryCode = normalizeCountryCode(trimValue(input.countryCode) || '+966')

  setError(errors, 'name', validateName(input.name, locale))
  setError(errors, 'email', validateEmail(input.email, locale))

  // Always validate raw phone for format feedback when user typed letters
  const rawPhone = trimValue(input.phone)
  if (phoneRequired || rawPhone || trimValue(input.countryCode)) {
    setError(
      errors,
      'countryCode',
      validateCountryCode(countryCode === '+' ? '' : countryCode, locale, phoneRequired || Boolean(rawPhone)),
    )
    // If raw had non-digits, show format error; else validate length on cleaned digits
    if (rawPhone && /[^\d]/.test(rawPhone)) {
      setError(errors, 'phone', validationMessage('phoneFormat', locale))
    } else {
      setError(errors, 'phone', validatePhone(phone || rawPhone, locale, phoneRequired))
    }
  }

  setError(
    errors,
    'nationality',
    validateNationality(input.nationality ?? '', locale, input.nationalityRequired),
  )

  return errors
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

/** Input handlers: strip non-digits while typing. */
export function handlePhoneInput(e: { currentTarget: HTMLInputElement }) {
  const cleaned = digitsOnly(e.currentTarget.value).slice(0, 15)
  if (e.currentTarget.value !== cleaned) {
    e.currentTarget.value = cleaned
  }
}

export function handleCountryCodeInput(e: { currentTarget: HTMLInputElement }) {
  const normalized = normalizeCountryCode(e.currentTarget.value).slice(0, 5)
  if (e.currentTarget.value !== normalized) {
    e.currentTarget.value = normalized
  }
}

export function handleIntegerInput(e: { currentTarget: HTMLInputElement }) {
  const cleaned = digitsOnly(e.currentTarget.value)
  if (e.currentTarget.value !== cleaned) {
    e.currentTarget.value = cleaned
  }
}

export function handleLettersOnlyInput(e: { currentTarget: HTMLInputElement }) {
  // Allow letters, marks, spaces, apostrophe, hyphen
  const cleaned = e.currentTarget.value.replace(/[^\p{L}\p{M}\s'.-]/gu, '')
  if (e.currentTarget.value !== cleaned) {
    e.currentTarget.value = cleaned
  }
}
