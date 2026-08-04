import { cn } from '@/lib/utils';

type PluginStatusToggleProps = {
    isActive: boolean;
    onChange: (isActive: boolean) => void;
    disabled?: boolean;
    id?: string;
};

export const PluginStatusToggle = ({
    isActive,
    onChange,
    disabled = false,
    id,
}: PluginStatusToggleProps) => {
    const activeIndex = isActive ? 0 : 1;

    return (
        <div
            id={id}
            className={cn(
                'rounded-md bg-[#111111] p-1 ring-1 ring-white/10',
                disabled && 'pointer-events-none opacity-60',
            )}
            role="group"
            aria-label="Plugin status"
        >
            <div className="relative grid grid-cols-2">
                <span
                    aria-hidden
                    className={cn(
                        'pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-sm transition-transform duration-300 ease-out',
                        isActive ? 'bg-primary' : 'bg-amber-400',
                    )}
                    style={{
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'relative z-10 h-9 rounded-sm text-sm font-medium',
                        isActive
                            ? 'text-black'
                            : 'text-foreground/75 hover:text-foreground',
                    )}
                    onClick={() => onChange(true)}
                >
                    Active
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'relative z-10 h-9 rounded-sm text-sm font-medium',
                        !isActive
                            ? 'text-black'
                            : 'text-foreground/75 hover:text-foreground',
                    )}
                    onClick={() => onChange(false)}
                >
                    Inactive
                </button>
            </div>
        </div>
    );
};
