import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  firstErrorMessage,
  hasErrors,
  setError,
  digitsOnly,
  normalizeCountryCode,
  validateContactFields,
  validateMessage,
  type ValidationLocale,
} from '@/lib/form-validation'

interface InquiryPayload {
  type: string
  referenceId: string
  referenceName: string
  referenceSummary?: string
  meta?: Record<string, unknown>
  name: string
  email: string
  nationality?: string
  countryCode?: string
  phone?: string
  travelers?: string
  message: string
  locale?: string
}

function extractPhoneNumber(phone?: string, countryCode?: string): string {
  const raw = (phone || '').trim()
  const code = (countryCode || '').trim()
  if (!raw) return ''
  // Prefer digits-only local number if already clean
  if (/^\d+$/.test(raw)) return raw
  if (code && raw.startsWith(code)) {
    return raw.slice(code.length).replace(/\D/g, '')
  }
  const parts = raw.split(/\s+/)
  if (parts.length > 1 && parts[0].startsWith('+')) {
    return parts.slice(1).join('').replace(/\D/g, '')
  }
  return raw.replace(/\D/g, '')
}

export async function POST(req: NextRequest) {
  let body: InquiryPayload

  try {
    body = (await req.json()) as InquiryPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const locale: ValidationLocale = body.locale === 'ar' ? 'ar' : 'en'
  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const message = (body.message || '').trim()
  const nationality = (body.nationality || '').trim()
  const countryCode = normalizeCountryCode(
    (body.countryCode || '').trim() ||
      ((body.phone || '').trim().startsWith('+')
        ? (body.phone || '').trim().split(/\s+/)[0]
        : '+966'),
  )
  const phoneNumber = digitsOnly(extractPhoneNumber(body.phone, body.countryCode))

  const errors = validateContactFields(
    {
      name,
      email,
      phone: phoneNumber,
      countryCode: countryCode === '+' ? '' : countryCode,
      nationality,
      phoneRequired: true,
    },
    locale,
  )
  setError(errors, 'message', validateMessage(message, locale, true, 5))

  if (hasErrors(errors)) {
    return NextResponse.json(
      {
        error: firstErrorMessage(errors, locale),
        fieldErrors: errors,
      },
      { status: 400 },
    )
  }

  const inquiryType = (body.type || 'contact').trim().slice(0, 50) || 'contact'
  const referenceName =
    (body.referenceName || '').trim().slice(0, 255) || 'Inquiry'
  const metaValue =
    body.meta && Object.keys(body.meta).length > 0
      ? (body.meta as Prisma.InputJsonValue)
      : Prisma.JsonNull

  const resolvedCountryCode = countryCode === '+' ? null : countryCode
  const resolvedPhone = resolvedCountryCode
    ? `${resolvedCountryCode} ${phoneNumber}`
    : phoneNumber || null

  try {
    await prisma.contactInquiry.create({
      data: {
        name: name.slice(0, 255),
        email: email.slice(0, 255),
        phone: resolvedPhone?.slice(0, 50) || null,
        nationality: nationality.slice(0, 100) || null,
        countryCode: resolvedCountryCode?.slice(0, 20) || null,
        travelers: body.travelers?.trim().slice(0, 50) || null,
        subject: referenceName,
        message,
        inquiryType,
        referenceId: body.referenceId?.trim().slice(0, 255) || null,
        referenceName,
        referenceSummary: body.referenceSummary?.trim() || null,
        meta: metaValue,
        locale: locale.slice(0, 10),
        status: 'new',
        isRead: false,
      },
    })
  } catch (err) {
    console.error('Failed to save contact inquiry', err)
    return NextResponse.json(
      { error: 'Failed to save inquiry' },
      { status: 500 },
    )
  }

  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = Number(process.env.EMAIL_PORT || 587)
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  const companyEmail = process.env.COMPANY_EMAIL || user
  const from = process.env.EMAIL_FROM || user || companyEmail

  if (!user || !pass || !companyEmail || !from) {
    console.error('Email environment variables are not fully configured')
    // Inquiry already saved for admin; do not fail the form submit.
    return NextResponse.json({ ok: true, emailSent: false })
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const metaLines =
    body.meta && Object.keys(body.meta).length
      ? Object.entries(body.meta)
          .map(([key, value]) => `${key}: ${String(value ?? '')}`)
          .join('\n')
      : ''

  const companySubject = `[${body.type.toUpperCase()} Inquiry] ${body.referenceName}`

  const companyText = [
    `New inquiry received for ${body.type}.`,
    '',
    `Reference: ${body.referenceName} (ID: ${body.referenceId})`,
    body.referenceSummary ? `Summary: ${body.referenceSummary}` : '',
    metaLines ? `\nDetails:\n${metaLines}` : '',
    '',
    'Customer information:',
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    body.nationality ? `Nationality: ${body.nationality}` : '',
    body.phone ? `Phone: ${body.phone}` : '',
    body.travelers ? `Travelers: ${body.travelers}` : '',
    '',
    'Message:',
    body.message,
  ]
    .filter(Boolean)
    .join('\n')

  const companyHtml = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px;background:#4a1c20;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">New ${body.type} inquiry</h1>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">${body.referenceName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;font-size:14px;color:#111827;">
                <h2 style="margin:0 0 8px;font-size:16px;">Reference</h2>
                <p style="margin:0 0 4px;"><strong>Name:</strong> ${body.referenceName}</p>
                <p style="margin:0 0 4px;"><strong>ID:</strong> ${body.referenceId}</p>
                ${
                  body.referenceSummary
                    ? `<p style="margin:0 0 12px;"><strong>Summary:</strong> ${body.referenceSummary}</p>`
                    : ''
                }
                ${
                  metaLines
                    ? `<h2 style="margin:16px 0 8px;font-size:16px;">Details</h2>
                <pre style="margin:0;background:#f9fafb;border-radius:8px;padding:10px 12px;font-size:13px;white-space:pre-wrap;">${metaLines}</pre>`
                    : ''
                }
                <h2 style="margin:16px 0 8px;font-size:16px;">Customer information</h2>
                <p style="margin:0 0 4px;"><strong>Name:</strong> ${body.name}</p>
                <p style="margin:0 0 4px;"><strong>Email:</strong> ${body.email}</p>
                ${
                  body.nationality
                    ? `<p style="margin:0 0 4px;"><strong>Nationality:</strong> ${body.nationality}</p>`
                    : ''
                }
                ${
                  body.phone
                    ? `<p style="margin:0 0 4px;"><strong>Phone:</strong> ${body.phone}</p>`
                    : ''
                }
                ${
                  body.travelers
                    ? `<p style="margin:0 0 4px;"><strong>Travelers:</strong> ${body.travelers}</p>`
                    : ''
                }
                <h2 style="margin:16px 0 8px;font-size:16px;">Message</h2>
                <p style="margin:0;white-space:pre-wrap;">${body.message}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const thanksSubject =
    body.locale === 'ar'
      ? 'شكراً لتواصلك مع شركة إلهام'
      : 'Thank you for contacting Elham'

  const thanksText =
    body.locale === 'ar'
      ? `عزيزنا ${body.name},\n\nشكرًا لتقديم طلب بخصوص (${body.referenceName}). لقد استلمنا رسالتك وسيتواصل معك فريقنا قريبًا لتأكيد التفاصيل والإجراءات.\n\nمع أطيب التحيات,\nفريق شركة إلهام`
      : `Dear ${body.name},\n\nThank you for your inquiry regarding (${body.referenceName}). We have received your message and our team will contact you soon to confirm the details and next steps.\n\nBest regards,\nElham Team`

  const thanksHtml =
    body.locale === 'ar'
      ? `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px;background:#4a1c20;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">شكرًا لتواصلك مع شركة إلهام</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;font-size:14px;color:#111827;">
                <p style="margin:0 0 12px;">عزيزنا ${body.name},</p>
                <p style="margin:0 0 12px;">شكرًا لتقديم طلب بخصوص (<strong>${body.referenceName}</strong>). لقد استلمنا رسالتك وسيتواصل معك فريقنا قريبًا لتأكيد التفاصيل والإجراءات.</p>
                <p style="margin:0 0 4px;">مع أطيب التحيات،</p>
                <p style="margin:0;font-weight:600;">فريق شركة إلهام</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
      : `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px;background:#4a1c20;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">Thank you for contacting Elham</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;font-size:14px;color:#111827;">
                <p style="margin:0 0 12px;">Dear ${body.name},</p>
                <p style="margin:0 0 12px;">Thank you for your inquiry regarding <strong>${body.referenceName}</strong>. We have received your message and our team will contact you soon to confirm the details and next steps.</p>
                <p style="margin:0 0 4px;">Best regards,</p>
                <p style="margin:0;font-weight:600;">Elham Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  try {
    await transporter.sendMail({
      from,
      to: companyEmail,
      replyTo: body.email,
      subject: companySubject,
      text: companyText,
      html: companyHtml,
    })

    await transporter.sendMail({
      from,
      to: body.email,
      subject: thanksSubject,
      text: thanksText,
      html: thanksHtml,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to send inquiry emails', err)
    // Inquiry is already saved; treat as success so the user is not blocked.
    return NextResponse.json({ ok: true, emailSent: false })
  }
}

