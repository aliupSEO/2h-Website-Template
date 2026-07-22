import { cn } from '@/lib/utils';

type ButtonSpinnerProps = {
    className?: string;
};

/** Compact CSS spinner for buttons (not the chatbot robot). */
export const ButtonSpinner = ({ className }: ButtonSpinnerProps) => {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={cn(
                'inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent',
                className,
            )}
        />
    );
};
