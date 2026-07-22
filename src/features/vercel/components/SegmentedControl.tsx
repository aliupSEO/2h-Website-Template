import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SegmentedControlProps<T extends string> = {
    value: T;
    options: { value: T; label: ReactNode }[];
    onChange: (value: T) => void;
    'aria-label': string;
    className?: string;
    buttonClassName?: string;
};

export const SegmentedControl = <T extends string>({
    value,
    options,
    onChange,
    'aria-label': ariaLabel,
    className,
    buttonClassName,
}: SegmentedControlProps<T>) => {
    const activeIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value),
    );
    const count = Math.max(options.length, 1);

    return (
        <div
            className={cn(
                'rounded-md bg-[#111111] p-1 ring-1 ring-white/10',
                className,
            )}
            role="group"
            aria-label={ariaLabel}
        >
            <div
                className="relative grid"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
            >
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 rounded-sm bg-primary transition-transform duration-300 ease-out"
                    style={{
                        width: `${100 / count}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />
                {options.map((option) => {
                    const active = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={cn(
                                'relative z-10 flex items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-xs font-medium whitespace-nowrap',
                                active
                                    ? 'text-primary-foreground'
                                    : 'text-foreground/75 hover:text-foreground',
                                buttonClassName,
                            )}
                            onClick={() => onChange(option.value)}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
