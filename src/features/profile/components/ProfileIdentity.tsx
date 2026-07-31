import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Loading } from '@/components/common';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
} from '@/components/ui';
import { toast } from '@/lib/toast';
import { profileService } from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { getInitials } from '../utils';

type ProfileIdentityProps = {
    name?: string;
    email?: string;
    roleLabel: string;
    avatarUrl?: string | null;
};

export const ProfileIdentity = ({
    name,
    email,
    roleLabel,
    avatarUrl,
}: ProfileIdentityProps) => {
    const setUser = useAuthStore((state) => state.setUser);
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        avatarUrl ?? null,
    );
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        setPreviewUrl(avatarUrl ?? null);
    }, [avatarUrl]);

    const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Choose an image file');
            return;
        }

        setUploading(true);
        try {
            const updated = await profileService.uploadAvatar(file);
            setUser(updated);
            setPreviewUrl(updated.avatarUrl);
            toast.success('Photo updated');
        }
        catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Could not update photo',
            );
        }
        finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setRemoving(true);
        try {
            const updated = await profileService.removeAvatar();
            setUser(updated);
            setPreviewUrl(null);
            toast.success('Photo removed');
        }
        catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Could not remove photo',
            );
        }
        finally {
            setRemoving(false);
        }
    };

    const busy = uploading || removing;

    return (
        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="group relative shrink-0 rounded-full outline-none transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
                aria-label="Change profile photo"
            >
                <span
                    aria-hidden
                    className="absolute -inset-1 rounded-full bg-primary/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                />
                <Avatar className="relative size-20 after:hidden ring-2 ring-primary/40 transition-[box-shadow,ring-color] duration-300 group-hover:ring-primary group-hover:shadow-[0_0_24px_rgba(198,245,50,0.25)] sm:size-24">
                    {previewUrl ? (
                        <AvatarImage src={previewUrl} alt={name ?? 'Profile'} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground sm:text-3xl">
                        {getInitials(name, email)}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {uploading ? (
                        <Loading size="sm" />
                    ) : (
                        <Camera className="size-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    )}
                </span>
            </button>

            <div className="min-w-0 flex-1 space-y-2.5">
                <div className="space-y-1">
                    <p className="truncate font-heading text-2xl font-semibold tracking-tight text-foreground transition-colors duration-200 sm:text-3xl">
                        {name?.trim() || 'Account'}
                    </p>
                    {email ? (
                        <p className="truncate text-base text-foreground/55">
                            {email}
                        </p>
                    ) : null}
                </div>
                <span className="inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-bold tracking-wide text-primary-foreground uppercase transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_16px_rgba(198,245,50,0.35)] hover:brightness-110">
                    {roleLabel}
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 gap-2 rounded-md bg-transparent px-4 text-sm ring-1 ring-white/12 transition-[background-color,box-shadow,color,transform] duration-200 hover:bg-primary/15 hover:text-primary hover:ring-primary/35 hover:shadow-[0_0_20px_rgba(198,245,50,0.12)] active:scale-[0.98]"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                >
                    {uploading ? (
                        <Loading size="sm" />
                    ) : (
                        <>
                            <Camera className="size-4" />
                            Change photo
                        </>
                    )}
                </Button>
                {previewUrl ? (
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-11 gap-2 px-3 text-foreground/55 transition-colors duration-200 hover:bg-white/[0.06] hover:text-foreground"
                        disabled={busy}
                        onClick={() => void handleRemove()}
                    >
                        {removing ? (
                            <Loading size="sm" />
                        ) : (
                            <>
                                <Trash2 className="size-4" />
                                Remove
                            </>
                        )}
                    </Button>
                ) : null}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleUpload(event)}
            />
        </div>
    );
};
