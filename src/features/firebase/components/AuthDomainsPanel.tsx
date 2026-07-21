import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import { Button, FormField, Input } from '@/components/ui';
import {
    addAuthorizedDomainSchema,
    type AddAuthorizedDomainSchema,
} from '@/features/firebase/schemas';

type AuthDomainsPanelProps = {
    domains: string[];
    onAdd: (domain: string) => Promise<void>;
    onRemove: (domain: string) => Promise<void>;
};

export const AuthDomainsPanel = ({
    domains,
    onAdd,
    onRemove,
}: AuthDomainsPanelProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddAuthorizedDomainSchema>({
        resolver: zodResolver(addAuthorizedDomainSchema),
        defaultValues: { domain: '' },
    });

    const submit = handleSubmit(async (values) => {
        await onAdd(values.domain.trim().toLowerCase());
        reset();
    });

    return (
        <div className="space-y-4">
            <form
                onSubmit={submit}
                className="flex flex-wrap items-end gap-3"
            >
                <div className="min-w-[220px] flex-1 sm:max-w-md">
                    <FormField
                        label="Authorized domain"
                        htmlFor="firebase-auth-domain"
                        required
                        error={errors.domain?.message}
                    >
                        <Input
                            id="firebase-auth-domain"
                            {...register('domain')}
                            placeholder="app.example.com"
                            className="h-10"
                        />
                    </FormField>
                </div>
                <Button
                    type="submit"
                    variant="brand"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loading size="sm" />
                    ) : (
                        <>
                            <Plus data-icon="inline-start" />
                            Add domain
                        </>
                    )}
                </Button>
            </form>

            {domains.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No authorized domains loaded. Add one to allow Auth on that
                    host.
                </p>
            ) : (
                <ul className="space-y-2">
                    {domains.map((domain) => (
                        <li
                            key={domain}
                            className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-4 py-3"
                        >
                            <span className="font-mono text-sm">{domain}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => void onRemove(domain)}
                            >
                                <Trash2 data-icon="inline-start" />
                                Remove
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
