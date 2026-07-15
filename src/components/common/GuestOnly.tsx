import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '@/stores/authStore'

/** Public auth routes — send already signed-in users to the app. */
export function GuestOnly() {
  const user = useAuthStore((state) => state.user)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
