import { cn } from '@/lib/utils';

type RepoVisibilityToggleProps = {
    isPrivate: boolean;
    onChange: (isPrivate: boolean) => void;
    id?: string;
};

export const RepoVisibilityToggle = ({
    isPrivate,
    onChange,
    id,
}: RepoVisibilityToggleProps) => {
    const activeIndex = isPrivate ? 0 : 1;

    return (
        <div
            id={id}
            className="rounded-md bg-[#111111] p-1 ring-1 ring-white/10"
            role="group"
            aria-label="Visibility"
        >
            <div className="relative grid grid-cols-2">
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-sm bg-primary transition-transform duration-300 ease-out"
                    style={{
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />
                <button
                    type="button"
                    className={cn(
                        'relative z-10 h-10 rounded-sm text-sm font-medium',
                        isPrivate
                            ? 'text-primary-foreground'
                            : 'text-foreground/75 hover:text-foreground',
                    )}
                    onClick={() => onChange(true)}
                >
                    Private
                </button>
                <button
                    type="button"
                    className={cn(
                        'relative z-10 h-10 rounded-sm text-sm font-medium',
                        !isPrivate
                            ? 'text-primary-foreground'
                            : 'text-foreground/75 hover:text-foreground',
                    )}
                    onClick={() => onChange(false)}
                >
                    Public
                </button>
            </div>
        </div>
    );
};
