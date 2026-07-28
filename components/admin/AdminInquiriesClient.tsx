'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Trash2, Eye, Mail } from 'lucide-react'

type InquiryRow = {
  id: string
  name: string
  email: string
  phone: string | null
  nationality: string | null
  countryCode: string | null
  travelers: string | null
  subject: string | null
  message: string
  inquiryType: string | null
  referenceId: string | null
  referenceName: string | null
  referenceSummary: string | null
  meta: Record<string, unknown> | null
  locale: string | null
  status: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
] as const

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'new':
      return 'default' as const
    case 'replied':
      return 'secondary' as const
    case 'archived':
      return 'outline' as const
    default:
      return 'secondary' as const
  }
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  )
}

export function AdminInquiriesClient() {
  const [items, setItems] = useState<InquiryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<InquiryRow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  async function fetchItems(status = statusFilter) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      const res = await fetch(`/api/admin/inquiries?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } else {
        setItems([])
      }
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openInquiry(row: InquiryRow) {
    setSelected(row)
    if (!row.isRead) {
      try {
        const res = await fetch(`/api/admin/inquiries/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
        if (res.ok) {
          const updated = (await res.json()) as InquiryRow
          setSelected(updated)
          setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        }
      } catch {
        // keep unread state if mark-as-read fails
      }
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = (await res.json()) as InquiryRow
        setSelected(updated)
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      }
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteId(null)
        if (selected?.id === id) setSelected(null)
        fetchItems()
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const unreadCount = items.filter((item) => !item.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Form inquiries</h1>
          <p className="text-muted-foreground">
            View submissions from contact and service inquiry forms on the website.
            {unreadCount > 0 ? ` ${unreadCount} unread.` : ''}
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            fetchItems(value)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <Mail className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p>No inquiries yet.</p>
          <p className="mt-1 text-sm">
            Submissions from website forms will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow
                  key={row.id}
                  className={!row.isRead ? 'bg-muted/40' : undefined}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!row.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <span className={!row.isRead ? 'font-semibold' : 'font-medium'}>
                        {row.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{row.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {row.inquiryType || 'contact'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <p className="truncate text-sm">
                      {row.referenceName || row.subject || '—'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(row.status)} className="capitalize">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View details"
                        onClick={() => openInquiry(row)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  Submitted {formatDate(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {selected.inquiryType || 'contact'}
                  </Badge>
                  <Select
                    value={selected.status}
                    disabled={updating}
                    onValueChange={(value) => updateStatus(selected.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${selected.email}`}>Reply by email</a>
                  </Button>
                </div>

                <dl className="space-y-3">
                  <DetailRow label="Email" value={selected.email} />
                  <DetailRow label="Phone" value={selected.phone} />
                  <DetailRow label="Nationality" value={selected.nationality} />
                  <DetailRow label="Country code" value={selected.countryCode} />
                  <DetailRow label="Travelers" value={selected.travelers} />
                  <DetailRow label="Locale" value={selected.locale} />
                  <DetailRow
                    label="Reference"
                    value={selected.referenceName || selected.subject}
                  />
                  <DetailRow label="Reference ID" value={selected.referenceId} />
                  <DetailRow label="Summary" value={selected.referenceSummary} />
                </dl>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Message</h3>
                  <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
                    {selected.message}
                  </p>
                </div>

                {selected.meta && Object.keys(selected.meta).length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      Extra details
                    </h3>
                    <dl className="space-y-2 rounded-md border p-3">
                      {Object.entries(selected.meta).map(([key, value]) => (
                        <DetailRow
                          key={key}
                          label={key}
                          value={value == null ? null : String(value)}
                        />
                      ))}
                    </dl>
                  </div>
                )}

                <Button
                  variant="destructive"
                  onClick={() => setDeleteId(selected.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete inquiry
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The inquiry will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
