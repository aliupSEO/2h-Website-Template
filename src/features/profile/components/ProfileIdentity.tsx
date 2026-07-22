import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
} from '@/components/ui';
import { toast } from '@/lib/toast';
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
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        avatarUrl ?? null,
    );

    const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Choose an image file');
            event.target.value = '';
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return objectUrl;
        });
        toast.success('Photo selected');
        event.target.value = '';
    };

    const handleRemove = () => {
        setPreviewUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return null;
        });
        toast.success('Photo removed');
    };

    return (
        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group relative shrink-0 rounded-full outline-none"
                aria-label="Change profile photo"
            >
                <Avatar className="size-20 after:hidden ring-2 ring-primary/40 transition-shadow group-hover:ring-primary sm:size-24">
                    {previewUrl ? (
                        <AvatarImage src={previewUrl} alt={name ?? 'Profile'} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground sm:text-3xl">
                        {getInitials(name, email)}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="size-5 text-white" />
                </span>
            </button>

            <div className="min-w-0 flex-1 space-y-2.5">
                <div className="space-y-1">
                    <p className="truncate font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {name?.trim() || 'Account'}
                    </p>
                    {email ? (
                        <p className="truncate text-base text-foreground/55">
                            {email}
                        </p>
                    ) : null}
                </div>
                <span className="inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-bold tracking-wide text-primary-foreground uppercase">
                    {roleLabel}
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 gap-2 rounded-md bg-transparent px-4 text-sm ring-1 ring-white/12 hover:bg-primary/15 hover:text-primary hover:ring-primary/30"
                    onClick={() => inputRef.current?.click()}
                >
                    <Camera className="size-4" />
                    Change photo
                </Button>
                {previewUrl ? (
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-11 gap-2 px-3 text-foreground/55 hover:text-foreground"
                        onClick={handleRemove}
                    >
                        <Trash2 className="size-4" />
                        Remove
                    </Button>
                ) : null}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
            />
        </div>
    );
};
