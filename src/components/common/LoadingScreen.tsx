import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loading, type LoadingSize } from './Loading';

type LoadingScreenProps = {
    label?: string;
    size?: LoadingSize;
    className?: string;
    delayMs?: number;
    variant?: 'default' | 'robot';
};

export const LoadingScreen = ({
    label,
    size = 'xl',
    className,
    delayMs = 0,
    variant = 'robot',
}: LoadingScreenProps) => {
    const [show, setShow] = useState(delayMs === 0);

    useEffect(() => {
        if (delayMs === 0) return;
        const timer = setTimeout(() => setShow(true), delayMs);
        return () => clearTimeout(timer);
    }, [delayMs]);

    if (!show) return null;

    return (
        <div
            className={cn(
                'flex min-h-[calc(100svh-8rem)] w-full flex-1 items-center justify-center',
                className,
            )}
        >
            <Loading size={size} label={label} variant={variant} />
        </div>
    );
};
