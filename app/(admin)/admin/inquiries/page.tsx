import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminInquiriesClient } from '@/components/admin/AdminInquiriesClient'

export default async function AdminInquiriesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-[calc(100vh-2rem)] p-6">
      <AdminInquiriesClient />
    </div>
  )
}
