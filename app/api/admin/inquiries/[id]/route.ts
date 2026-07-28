import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_STATUSES = new Set(['new', 'read', 'replied', 'archived'])

async function ensureAuth() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await ensureAuth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const row = await prisma.contactInquiry.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }
    return NextResponse.json(row)
  } catch (e) {
    console.error('Get inquiry error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await ensureAuth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const existing = await prisma.contactInquiry.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    const body = await request.json()
    const data: { status?: string; isRead?: boolean } = {}

    if (typeof body.status === 'string' && ALLOWED_STATUSES.has(body.status)) {
      data.status = body.status
      if (body.status !== 'new' && body.isRead === undefined) {
        data.isRead = true
      }
    }
    if (typeof body.isRead === 'boolean') {
      data.isRead = body.isRead
      if (body.isRead && existing.status === 'new' && data.status === undefined) {
        data.status = 'read'
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('Update inquiry error:', e)
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await ensureAuth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await prisma.contactInquiry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Delete inquiry error:', e)
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 },
    )
  }
}
