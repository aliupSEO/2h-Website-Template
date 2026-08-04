import liveChatbot from '@/assets/live-chatbot.svg';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZE_CLASS = {
    sm: 'size-5',
    md: 'size-8',
    lg: 'size-40',
    xl: 'size-64',
} as const;

export type LoadingSize = keyof typeof SIZE_CLASS;

type LoadingProps = {
    size?: LoadingSize;
    className?: string;
    label?: string;
    variant?: 'default' | 'robot';
};

export const Loading = ({ size = 'md', className, label, variant = 'default' }: LoadingProps) => {
    const isRobot = variant === 'robot';

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={cn(
                'inline-flex items-center justify-center gap-3',
                isRobot ? 'flex-col' : 'flex-row',
                className
            )}
        >
            {isRobot ? (
                <img
                    src={liveChatbot}
                    alt=""
                    aria-hidden
                    className={cn('object-contain select-none', SIZE_CLASS[size])}
                />
            ) : (
                <Loader2
                    className={cn('animate-spin text-current', SIZE_CLASS[size])}
                />
            )}
            <span className="sr-only">{label ?? 'Loading'}</span>
            {label ? (
                <span className="text-sm text-muted-foreground">{label}</span>
            ) : null}
        </div>
    );
};
