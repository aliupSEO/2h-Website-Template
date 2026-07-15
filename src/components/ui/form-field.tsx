import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

type FormFieldProps = {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  className?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  className,
  action,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="gap-0.5">
          <span>{label}</span>
          {required ? <span className="text-destructive">*</span> : null}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
