import type { CSSProperties } from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
type ToastMessage = string;
const success = (message: ToastMessage) => {
    sonnerToast.success(message);
};
const error = (message: ToastMessage) => {
    sonnerToast.error(message);
};
const info = (message: ToastMessage) => {
    sonnerToast(message);
};
/** Minimal success / failure toasts — use instead of ad-hoc sonner calls. */
export const toast = {
    success,
    error,
    info,
};
const toasterStyle = {
    '--toast-close-button-start': 'unset',
    '--toast-close-button-end': '0',
    '--toast-close-button-transform': 'translate(35%, -35%)',
} as CSSProperties;
export const Toaster = () => {
    return (<SonnerToaster position="top-right" 
    // Clear app header (h-14) so toasts sit in the main body, not over chrome
    offset={{ top: '4.5rem', right: '1rem' }} mobileOffset={{ top: '4.5rem', right: '0.75rem' }} theme="dark" closeButton style={toasterStyle} toastOptions={{
            classNames: {
                toast: '!rounded-2xl border-0 bg-card text-foreground shadow-[0_28px_90px_rgba(0,0,0,0.55)]',
                title: 'text-sm font-medium text-foreground',
                description: 'text-xs text-muted-foreground',
                success: '!bg-card border-0',
                error: '!bg-card border-0',
                closeButton: '!left-auto !right-0 !rounded-full border-0 bg-muted text-muted-foreground',
            },
        }}/>);
};
