import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [inquiriesCount, unreadInquiries, bookingsCount, hotelsCount, packagesCount] =
    await Promise.all([
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { isRead: false } }),
      prisma.booking.count(),
      prisma.hotel.count(),
      prisma.tourPackage.count(),
    ])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.name || session.email}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/inquiries" className="block transition-opacity hover:opacity-90">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contact inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{inquiriesCount}</p>
              {unreadInquiries > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {unreadInquiries} unread
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{bookingsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hotels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{hotelsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tour packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{packagesCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Use the sidebar to manage Hotels, Packages, Events, Transportation,
          Blog, Testimonials, and Inquiries.
        </CardContent>
      </Card>
    </div>
  )
}
