import { cn } from '@/lib/utils';
import { Loading, type LoadingSize } from './Loading';
type LoadingOverlayProps = {
    label?: string;
    size?: LoadingSize;
    className?: string;
};
export const LoadingOverlay = ({ label, size = 'lg', className, }: LoadingOverlayProps) => {
    return (<div className={cn('absolute inset-0 z-40 flex items-center justify-center bg-background/70', className)}>
      <Loading size={size} label={label}/>
    </div>);
};
