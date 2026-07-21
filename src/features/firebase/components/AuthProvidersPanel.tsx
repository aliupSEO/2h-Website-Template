import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import {
    FIREBASE_IDP_OPTIONS,
    upsertIdpProviderSchema,
    type UpsertIdpProviderSchema,
} from '@/features/firebase/schemas';
import type { FirebaseIdpProvider } from '@/features/firebase/types';

type AuthProvidersPanelProps = {
    providers: FirebaseIdpProvider[];
    createOpen: boolean;
    onCreateOpenChange: (open: boolean) => void;
    onCreate: (values: UpsertIdpProviderSchema) => Promise<void>;
    onToggle: (provider: FirebaseIdpProvider, enabled: boolean) => Promise<void>;
};

export const AuthProvidersPanel = ({
    providers,
    createOpen,
    onCreateOpenChange,
    onCreate,
    onToggle,
}: AuthProvidersPanelProps) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpsertIdpProviderSchema>({
        resolver: zodResolver(upsertIdpProviderSchema),
        defaultValues: {
            idpId: 'google.com',
            enabled: true,
            clientId: '',
            clientSecret: '',
        },
    });

    useEffect(() => {
        if (!createOpen) {
            reset({
                idpId: 'google.com',
                enabled: true,
                clientId: '',
                clientSecret: '',
            });
        }
    }, [createOpen, reset]);

    const submit = handleSubmit(async (values) => {
        await onCreate(values);
        onCreateOpenChange(false);
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="brand"
                    onClick={() => onCreateOpenChange(true)}
                >
                    Configure provider
                </Button>
            </div>

            {providers.length === 0 ? (
                <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-muted-foreground">
                        No OAuth identity providers configured yet.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead>Provider</TableHead>
                                <TableHead>Client ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {providers.map((provider) => (
                                <TableRow
                                    key={provider.idpId}
                                    className="border-white/5"
                                >
                                    <TableCell className="font-medium">
                                        {provider.idpId}
                                    </TableCell>
                                    <TableCell className="max-w-[240px] truncate font-mono text-xs">
                                        {provider.clientId ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        {provider.enabled ? 'Enabled' : 'Disabled'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                void onToggle(
                                                    provider,
                                                    !provider.enabled,
                                                );
                                            }}
                                        >
                                            {provider.enabled
                                                ? 'Disable'
                                                : 'Enable'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configure sign-in provider</DialogTitle>
                        <DialogDescription>
                            Uses Identity Toolkit defaultSupportedIdpConfigs.
                            Client secret is stored in Google, never returned to
                            Hub.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-4">
                        <FormField
                            label="Provider"
                            htmlFor="firebase-idp"
                            required
                            error={errors.idpId?.message}
                        >
                            <Controller
                                name="idpId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="h-10 w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FIREBASE_IDP_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>

                        <FormField
                            label="Client ID"
                            htmlFor="firebase-idp-client-id"
                            required
                            error={errors.clientId?.message}
                        >
                            <Input
                                id="firebase-idp-client-id"
                                {...register('clientId')}
                                className="h-10"
                                placeholder="OAuth client id"
                            />
                        </FormField>

                        <FormField
                            label="Client secret"
                            htmlFor="firebase-idp-client-secret"
                            required
                            error={errors.clientSecret?.message}
                        >
                            <Input
                                id="firebase-idp-client-secret"
                                {...register('clientSecret')}
                                type="password"
                                className="h-10"
                                placeholder="OAuth client secret"
                            />
                        </FormField>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onCreateOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="brand"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loading size="sm" />
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
