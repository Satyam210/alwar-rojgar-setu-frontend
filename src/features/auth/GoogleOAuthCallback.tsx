import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import { getCurrentUser } from '@/api/users';
import { setAccessToken } from '@/api/client';
import { toast } from '@/components/ui/toast';

export function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    async function handleCallback() {
      const status = searchParams.get('status');
      const token = searchParams.get('token');

      if (status === 'success' && token) {
        try {
          setAccessToken(token);
          const user = await getCurrentUser();
          setUser(user);
          navigate(postLoginPath(user.role, isProfileComplete(user)), { replace: true });
          toast.success('Login successful!');
        } catch (err) {
          console.error('Failed to complete Google login:', err);
          toast.error('Failed to complete login');
          navigate('/login', { replace: true });
        }
      } else if (status === 'disabled') {
        toast.error('Account is disabled. Contact support.');
        navigate('/login', { state: { disabled: true }, replace: true });
      } else {
        toast.error('Login failed');
        navigate('/login', { replace: true });
      }
    }

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-content-muted">Completing login...</p>
      </div>
    </div>
  );
}
