import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = ({ className, type, ...props }: React.ComponentProps<'input'>) => {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'h-9 w-full min-w-0 rounded-lg border-0 bg-field px-3 py-2 text-base text-foreground outline-none transition-colors',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-0',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                'md:text-sm',
                // Same fill for invalid + browser autofill (no warm/blue tint drift)
                'aria-invalid:bg-field',
                'autofill:shadow-[inset_0_0_0_1000px_var(--field)]',
                'autofill:[-webkit-text-fill-color:var(--foreground)]',
                className,
            )}
            {...props}
        />
    );
};

export { Input };
