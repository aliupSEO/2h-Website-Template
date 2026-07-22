import { Lock, Search, Unlock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui';
import type { GitRepo } from '@/features/git/types';
import { cn } from '@/lib/utils';

type GitRepoPickerProps = {
    repos: GitRepo[];
    value: string;
    onChange: (fullName: string, repo: GitRepo) => void;
    disabled?: boolean;
};

export const GitRepoPicker = ({
    repos,
    value,
    onChange,
    disabled = false,
}: GitRepoPickerProps) => {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const sorted = [...repos].sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
        );
        if (!needle) return sorted;
        return sorted.filter((repo) => {
            const haystack = [repo.fullName, repo.description ?? '']
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [repos, query]);

    return (
        <div className="overflow-hidden rounded-xl bg-[#111111] ring-1 ring-white/10">
            <div className="relative border-b border-white/5">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-foreground/45" />
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search repositories…"
                    disabled={disabled}
                    className="h-10 rounded-none border-0 bg-transparent pl-9 text-sm ring-0"
                    aria-label="Search repositories"
                />
            </div>

            <ul
                className="max-h-36 overflow-y-auto overscroll-contain p-1 sm:max-h-40"
                role="listbox"
                aria-label="GitHub repositories"
            >
                {filtered.length === 0 ? (
                    <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No repositories match your search.
                    </li>
                ) : (
                    filtered.map((repo) => {
                        const selected = value === repo.fullName;
                        return (
                            <li key={repo.id}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    disabled={disabled}
                                    className={cn(
                                        'flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
                                        selected
                                            ? 'bg-primary/20 text-foreground ring-1 ring-primary/35'
                                            : 'text-foreground/85 hover:bg-white/[0.05]',
                                        disabled && 'opacity-60',
                                    )}
                                    onClick={() => onChange(repo.fullName, repo)}
                                >
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md',
                                            selected
                                                ? 'bg-primary/25 text-primary'
                                                : 'bg-white/[0.06] text-foreground/55',
                                        )}
                                    >
                                        {repo.private ? (
                                            <Lock className="size-3" />
                                        ) : (
                                            <Unlock className="size-3" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium">
                                            {repo.fullName}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                                            {repo.private ? 'Private' : 'Public'}
                                            {' · '}
                                            {repo.defaultBranch}
                                            {repo.description
                                                ? ` · ${repo.description}`
                                                : ''}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};
