'use client'

import { cn } from '@/lib/utils'

export function FieldError({
  message,
  className,
  isRTL,
}: {
  message?: string | null
  className?: string
  isRTL?: boolean
}) {
  if (!message) return null
  return (
    <p
      role="alert"
      className={cn('text-xs text-red-600 dark:text-red-400', className)}
      style={isRTL ? { textAlign: 'right' } : undefined}
    >
      {message}
    </p>
  )
}

export function fieldInvalidClass(hasError?: boolean): string {
  return hasError ? 'border-red-500 focus-visible:ring-red-500' : ''
}
