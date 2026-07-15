import type { CSSProperties } from 'react'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'

type ToastMessage = string

function success(message: ToastMessage) {
  sonnerToast.success(message)
}

function error(message: ToastMessage) {
  sonnerToast.error(message)
}

function info(message: ToastMessage) {
  sonnerToast(message)
}

/** Minimal success / failure toasts — use instead of ad-hoc sonner calls. */
export const toast = {
  success,
  error,
  info,
}

const toasterStyle = {
  '--toast-close-button-start': 'unset',
  '--toast-close-button-end': '0',
  '--toast-close-button-transform': 'translate(35%, -35%)',
} as CSSProperties

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      // Clear app header (h-14) so toasts sit in the main body, not over chrome
      offset={{ top: '4.5rem', right: '1rem' }}
      mobileOffset={{ top: '4.5rem', right: '0.75rem' }}
      theme="dark"
      closeButton
      style={toasterStyle}
      toastOptions={{
        classNames: {
          toast:
            'border border-white/12 bg-background text-foreground shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
          title: 'text-sm font-medium text-foreground',
          description: 'text-xs text-muted-foreground',
          success: 'border-white/12',
          error: 'border-white/12',
          closeButton:
            '!left-auto !right-0 border-white/10 bg-muted text-muted-foreground',
        },
      }}
    />
  )
}
