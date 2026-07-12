import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import { getCurrentUser } from '@/api/users';
import { setAccessToken } from '@/api/client';
import { toast } from '@/components/ui/toast';

export function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useTranslation('auth');
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    async function handleCallback() {
      const status = searchParams.get('status');
      const token = searchParams.get('token');
      const method = searchParams.get('method') as 'email' | 'google' | null;

      switch (status) {
        case 'success': {
          if (!token) {
            toast.error('Login failed');
            navigate('/login', { replace: true });
            return;
          }
          try {
            setAccessToken(token);
            const user = await getCurrentUser();
            setUser(user);
            navigate(postLoginPath(user.role, isProfileComplete(user)), { replace: true });
            toast.success('Login successful!');
          } catch {
            toast.error('Failed to complete login');
            navigate('/login', { replace: true });
          }
          break;
        }

        case 'conflict': {
          const message =
            method === 'email'
              ? t('errors.conflictEmail')
              : t('errors.conflictGoogle');
          toast.error(message);
          navigate('/login', { replace: true });
          break;
        }

        case 'disabled': {
          toast.error(t('disabled.body'));
          navigate('/login', { state: { disabled: true }, replace: true });
          break;
        }

        case 'pending': {
          navigate('/login', { state: { pending: true }, replace: true });
          break;
        }

        case 'rejected': {
          navigate('/login', { state: { rejected: true }, replace: true });
          break;
        }

        default: {
          toast.error('Google sign-in failed. Please try again.');
          navigate('/login', { replace: true });
        }
      }
    }

    handleCallback();
  }, [searchParams, navigate, setUser, t]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
        <p className="mt-4 text-content-muted">Completing login…</p>
      </div>
    </div>
  );
}
