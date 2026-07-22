import { cn } from '@/lib/utils';
import { Loading, type LoadingSize } from './Loading';

type LoadingScreenProps = {
    label?: string;
    size?: LoadingSize;
    className?: string;
};

export const LoadingScreen = ({
    label,
    size = 'xl',
    className,
}: LoadingScreenProps) => {
    return (
        <div
            className={cn(
                'flex min-h-[calc(100svh-8rem)] w-full flex-1 items-center justify-center',
                className,
            )}
        >
            <Loading size={size} label={label} />
        </div>
    );
};
