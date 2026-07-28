import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const unreadOnly = searchParams.get('unread') === '1'
    const type = searchParams.get('type')

    const list = await prisma.contactInquiry.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(unreadOnly ? { isRead: false } : {}),
        ...(type ? { inquiryType: type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(list)
  } catch (e) {
    console.error('List inquiries error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 },
    )
  }
}
