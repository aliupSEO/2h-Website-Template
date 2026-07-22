import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import authBg from '@/assets/authbg-developers.jpg';
import logo2h from '@/assets/logo-2h.png';
import { DocumentTitle } from '@/components/common/DocumentTitle';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui';

type AuthLayoutProps = {
    title: string;
    description: string;
    /** Browser tab label; defaults to `title`. */
    documentTitle?: string;
    children: ReactNode;
};

export const AuthLayout = ({
    title,
    description,
    documentTitle,
    children,
}: AuthLayoutProps) => {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
            <DocumentTitle title={documentTitle ?? title} />
            <img
                src={authBg}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover object-center"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
            />

            <Card className="relative z-10 w-full max-w-[26rem] min-h-[36rem] gap-0 overflow-hidden rounded-2xl border-0 bg-[#1a1a1a] py-0 shadow-[0_40px_120px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]">
                {/* Brand accent bar */}
                <div
                    aria-hidden
                    className="h-1 w-full bg-gradient-to-r from-transparent via-brand-green to-transparent"
                />

                <CardHeader className="justify-items-center space-y-0 px-8 pt-9 pb-0 text-center sm:px-10 sm:pt-10">
                    <Link
                        to="/auth/sign-in"
                        className="mb-7 flex flex-col items-center gap-2"
                    >
                        <img
                            src={logo2h}
                            alt="2H Web Solutions"
                            className="h-12 w-auto object-contain"
                        />
                        <span className="rounded-md bg-white/5 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                            Central Hub
                        </span>
                    </Link>

                    <div className="mx-auto mb-7 h-px w-16 bg-white/10" />

                    <CardTitle className="text-[1.65rem] font-semibold tracking-tight text-foreground">
                        {title}
                    </CardTitle>
                    <CardDescription className="mt-2 max-w-[18rem] text-center text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-center px-8 pt-8 pb-10 sm:px-10 sm:pb-12">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
};
