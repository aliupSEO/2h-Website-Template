import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

import {
  DashboardLoadingPreview,
  PreviewLoadingButton,
} from './PreviewLoadingButton'

export function DashboardOverview() {
  const user = useAuthStore((state) => state.user)
  const [previewLoading, setPreviewLoading] = useState(false)

  if (previewLoading) {
    return (
      <DashboardLoadingPreview onDone={() => setPreviewLoading(false)} />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ''}. You are signed in
            to 2H Central Hub.
          </p>
        </div>

        <PreviewLoadingButton onPreview={() => setPreviewLoading(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Active account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{user?.email ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Production hub</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate authenticated areas of the app.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
