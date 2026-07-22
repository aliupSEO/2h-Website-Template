import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import { VERCEL_FRAMEWORKS } from '@/features/vercel/schemas';
import { cn } from '@/lib/utils';

const QUICK_FRAMEWORKS = [
    { value: 'auto', label: 'Auto' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'vite', label: 'Vite' },
    { value: 'remix', label: 'Remix' },
    { value: 'astro', label: 'Astro' },
] as const;

type FrameworkPickerProps = {
    value: string;
    onChange: (value: string) => void;
    id?: string;
};

export const FrameworkPicker = ({
    value,
    onChange,
    id,
}: FrameworkPickerProps) => {
    const isQuick = QUICK_FRAMEWORKS.some((item) => item.value === value);

    return (
        <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1 rounded-xl bg-[#111111] p-1 ring-1 ring-white/10">
                {QUICK_FRAMEWORKS.map((framework) => {
                    const active = value === framework.value;
                    return (
                        <button
                            key={framework.value}
                            type="button"
                            className={cn(
                                'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground/70 hover:bg-white/[0.05] hover:text-foreground',
                            )}
                            onClick={() => onChange(framework.value)}
                        >
                            {framework.label}
                        </button>
                    );
                })}
            </div>

            <Select
                value={isQuick ? undefined : value}
                onValueChange={onChange}
            >
                <SelectTrigger
                    id={id}
                    className="h-10 w-full rounded-md bg-[#2a2a2a] ring-1 ring-white/10"
                >
                    <SelectValue placeholder="More frameworks…" />
                </SelectTrigger>
                <SelectContent className="max-h-64 border-0 bg-card">
                    {VERCEL_FRAMEWORKS.filter(
                        (framework) =>
                            !QUICK_FRAMEWORKS.some(
                                (quick) => quick.value === framework.value,
                            ),
                    ).map((framework) => (
                        <SelectItem
                            key={framework.value}
                            value={framework.value}
                        >
                            {framework.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
