import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '@/components/common';
import { Button } from '@/components/ui';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/stores/authStore';
const GoogleIcon = ({ className }: {
    className?: string;
}) => {
    return (<svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"/>
      <path fill="#34A853" d="M6.6 14.3 5.8 14.9l-2.5 1.9C4.9 19.5 8.2 21.6 12 21.6c1.9 0 3.6-.6 4.9-1.7l-3.1-2.4c-.8.6-1.9.9-3 .9-2.3 0-4.3-1.6-5-3.7z"/>
      <path fill="#4A90E2" d="M3.3 7.2A9.6 9.6 0 0 0 2.4 12c0 1.7.4 3.3 1.1 4.7l3.1-2.4A5.8 5.8 0 0 1 6.2 12c0-.8.1-1.5.4-2.2z"/>
      <path fill="#FBBC05" d="M12 6.4c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9.3 9.3 0 0 0 12 2.4c-3.8 0-7.1 2.1-8.7 5.1l3.1 2.4c.7-2.1 2.7-3.5 5.6-3.5z"/>
    </svg>);
};
export const GoogleSignInButton = () => {
    const navigate = useNavigate();
    const signIn = useAuthStore((state) => state.signIn);
    const [pending, setPending] = useState(false);
    const handleGoogleSignIn = async () => {
        try {
            setPending(true);
            // Placeholder until Google OAuth is wired to the backend.
            await new Promise((resolve) => setTimeout(resolve, 600));
            signIn('google.user@2h.com');
            toast.success('Signed in with Google');
            navigate('/dashboard', { replace: true });
        }
        catch {
            toast.error('Google sign in failed');
        }
        finally {
            setPending(false);
        }
    };
    return (<Button type="button" variant="outline" size="lg" className="w-full gap-2 border-white/20 bg-transparent hover:bg-white/5" disabled={pending} onClick={() => void handleGoogleSignIn()}>
      {pending ? (<Loading size="sm"/>) : (<>
          <GoogleIcon className="size-4"/>
          Continue with Google
        </>)}
    </Button>);
};
