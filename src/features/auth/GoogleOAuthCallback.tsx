import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import { getCurrentUser } from '@/api/users';
import { setAccessToken } from '@/api/client';
import { completeGoogleSignup } from '@/api/auth';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ApiError } from '@/api/client';
import type { Role } from '@/api/types';

export function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useTranslation('auth');
  const hasHandled = useRef(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [submittingRole, setSubmittingRole] = useState<Extract<Role, 'candidate' | 'employer'> | null>(null);

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

        case 'needs-role': {
          const token = searchParams.get('pendingToken');
          if (!token) {
            toast.error(t('googleRole.missingToken'));
            navigate('/login', { replace: true });
            return;
          }
          setPendingToken(token);
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

  async function handleChooseRole(role: Extract<Role, 'candidate' | 'employer'>) {
    if (!pendingToken || submittingRole) return;
    setSubmittingRole(role);
    try {
      await completeGoogleSignup({ pendingToken, role });
      const user = await getCurrentUser();
      setUser(user);
      navigate(postLoginPath(user.role, isProfileComplete(user)), { replace: true });
      toast.success(t('googleRole.success'));
    } catch (err) {
      toast.error((err as ApiError).message ?? t('googleRole.failed'));
      navigate('/login', { replace: true });
    } finally {
      setSubmittingRole(null);
    }
  }

  if (pendingToken) {
    return (
      <div className="mx-auto mt-16 max-w-md px-4">
        <Card className="p-6 text-center sm:p-8">
          <h1 className="text-xl font-bold text-content">{t('googleRole.title')}</h1>
          <p className="mt-1 text-sm text-content-muted">{t('googleRole.subtitle')}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              block
              loading={submittingRole === 'candidate'}
              disabled={submittingRole !== null}
              onClick={() => handleChooseRole('candidate')}
            >
              {t('googleRole.jobSeeker')}
            </Button>
            <Button
              block
              variant="secondary"
              loading={submittingRole === 'employer'}
              disabled={submittingRole !== null}
              onClick={() => handleChooseRole('employer')}
            >
              {t('googleRole.employer')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-24">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
        <p className="mt-4 text-content-muted">Completing login…</p>
      </div>
    </div>
  );
}
