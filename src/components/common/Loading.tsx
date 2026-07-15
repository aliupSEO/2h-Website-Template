import liveChatbot from '@/assets/live-chatbot.svg';
import { cn } from '@/lib/utils';
const SIZE_CLASS = {
    sm: 'size-10',
    md: 'size-24',
    lg: 'size-40',
    xl: 'size-56',
} as const;
export type LoadingSize = keyof typeof SIZE_CLASS;
type LoadingProps = {
    size?: LoadingSize;
    className?: string;
    label?: string;
};
export const Loading = ({ size = 'md', className, label }: LoadingProps) => {
    return (<div role="status" aria-live="polite" aria-busy="true" className={cn('inline-flex flex-col items-center justify-center gap-0.5', className)}>
      <img src={liveChatbot} alt="" aria-hidden className={cn('object-contain select-none', SIZE_CLASS[size])}/>
      <span className="sr-only">{label ?? 'Loading'}</span>
      {label ? (<span className="text-xs text-muted-foreground">{label}</span>) : null}
    </div>);
};
