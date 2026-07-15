import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={
        className ??
        'mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-6 py-12'
      }
    >
      {children}
    </div>
  )
}
