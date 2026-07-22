import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>;

export const PasswordInput = ({
    className,
    disabled,
    ...props
}: PasswordInputProps) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                type={visible ? 'text' : 'password'}
                disabled={disabled}
                className={cn('pr-11', className)}
                {...props}
            />
            <button
                type="button"
                tabIndex={-1}
                disabled={disabled}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground/45 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setVisible((current) => !current)}
            >
                {visible ? (
                    <EyeOff className="size-4" aria-hidden />
                ) : (
                    <Eye className="size-4" aria-hidden />
                )}
            </button>
        </div>
    );
};
