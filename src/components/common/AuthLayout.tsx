import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import authBg from '@/assets/authbg.jpg'
import logo2h from '@/assets/logo-2h.png'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'

type AuthLayoutProps = {
  title: string
  description: string
  children: ReactNode
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <img
        src={authBg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover object-center"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/35"
      />

      <div className="relative z-10 mb-8 flex flex-col items-center gap-1">
        <Link to="/auth/sign-in" className="flex flex-col items-center gap-1">
          <img
            src={logo2h}
            alt="2H Web Solutions"
            className="h-10 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
          />
          <span className="text-[11px] font-medium tracking-wide text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            Central Hub
          </span>
        </Link>
      </div>

      <Card className="relative z-10 w-full max-w-md gap-0 border-0 bg-surface py-0 shadow-[0_28px_90px_rgba(0,0,0,0.75)] ring-0">
        <CardHeader className="justify-items-center space-y-0 px-8 pt-8 pb-2 text-center">
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pt-4 pb-8">{children}</CardContent>
      </Card>
    </div>
  )
}
