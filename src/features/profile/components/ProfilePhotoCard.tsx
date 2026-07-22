import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui';
import { toast } from '@/lib/toast';
import { getInitials } from '../utils';

type ProfilePhotoCardProps = {
    name?: string;
    email?: string;
    roleLabel: string;
    avatarUrl?: string | null;
};

export const ProfilePhotoCard = ({
    name,
    email,
    roleLabel,
    avatarUrl,
}: ProfilePhotoCardProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null);

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
        <Card>
            <CardHeader>
                <CardTitle>Your account</CardTitle>
                <CardDescription>
                    Photo and account details. Email and role come from sign-in.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="group relative shrink-0 rounded-full outline-none"
                        aria-label="Change profile photo"
                    >
                        <Avatar className="size-20 after:hidden sm:size-24">
                            {previewUrl ? (
                                <AvatarImage
                                    src={previewUrl}
                                    alt={name ?? 'Profile'}
                                />
                            ) : null}
                            <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground sm:text-2xl">
                                {getInitials(name, email)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera className="size-5 text-white" />
                        </span>
                    </button>

                    <div className="min-w-0 space-y-1.5">
                        <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                            {name?.trim() || 'Account'}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                            {email ? <span className="truncate">{email}</span> : null}
                            {email ? (
                                <span className="text-white/20" aria-hidden>
                                    ·
                                </span>
                            ) : null}
                            <span className="text-primary">{roleLabel}</span>
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 gap-2 border-white/15 bg-white/[0.03] px-4 font-medium hover:bg-white/[0.08]"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Camera className="size-4 text-primary" />
                        Change photo
                    </Button>
                    {previewUrl ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-10 gap-2 text-muted-foreground hover:text-foreground"
                            onClick={handleRemove}
                        >
                            <Trash2 className="size-4" />
                            Remove
                        </Button>
                    ) : null}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
