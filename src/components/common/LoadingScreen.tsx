import { cn } from '@/lib/utils';
import { Loading, type LoadingSize } from './Loading';
type LoadingScreenProps = {
    label?: string;
    size?: LoadingSize;
    className?: string;
};
export const LoadingScreen = ({ label, size = 'lg', className, }: LoadingScreenProps) => {
    return (<div className={cn('flex min-h-48 w-full flex-1 items-center justify-center', className)}>
      <Loading size={size} label={label}/>
    </div>);
};
