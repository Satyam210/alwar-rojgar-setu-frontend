import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { loginWithEmailPassword, registerWithEmailPassword, initiateGoogleLogin } from '@/api/auth';
import { getCurrentUser } from '@/api/users';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import { translateError } from '@/lib/validation';
import type { ApiError } from '@/api/client';
import type { Role } from '@/api/types';
import {
  loginSchema,
  registerSchema,
  type LoginForm,
  type RegisterForm,
} from './schemas';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';
import { DemoLoginPanel } from '@/components/dev/DemoLoginPanel';
import { toast } from '@/components/ui/toast';

type AuthMode = 'login' | 'signup';

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  usePageTitle(t('auth:login.title'));
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  const [mode, setMode] = useState<AuthMode>('login');
  const disabled = (location.state as { disabled?: boolean } | null)?.disabled;
  const from = (location.state as { from?: string } | null)?.from;

  async function completeLogin() {
    const user = await getCurrentUser();
    setUser(user);
    navigate(from ?? postLoginPath(user.role, isProfileComplete(user)), { replace: true });
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6 sm:p-8">
        {env.useMocks && <DemoLoginPanel />}

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-content">
            {mode === 'login' ? t('auth:login.title') : t('auth:signup.title')}
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            {mode === 'login' ? t('auth:login.subtitle') : t('auth:signup.subtitle')}
          </p>
        </div>

        {disabled && (
          <div className="mb-5 rounded-lg border border-danger/30 bg-red-50 p-3" role="alert">
            <p className="font-semibold text-danger">{t('auth:disabled.title')}</p>
            <p className="text-sm text-content">{t('auth:disabled.body')}</p>
          </div>
        )}

        <GoogleAuthButton
          label={mode === 'login' ? t('auth:login.googleButton') : t('auth:signup.googleButton')}
        />

        <AuthDivider label={t('common:common.or')} />

        {mode === 'login' ? (
          <LoginForm onSuccess={completeLogin} />
        ) : (
          <SignupForm onSuccess={completeLogin} />
        )}

        <p className="mt-6 text-center text-sm text-content-muted">
          {mode === 'login' ? t('auth:login.noAccount') : t('auth:signup.haveAccount')}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-brand-700 underline-offset-2 hover:underline"
          >
            {mode === 'login' ? t('auth:login.createOne') : t('auth:signup.loginLink')}
          </button>
        </p>
      </Card>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function GoogleAuthButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => initiateGoogleLogin()}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-content shadow-sm transition-all hover:border-content-muted hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
    >
      <GoogleLogo />
      {label}
    </button>
  );
}

function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium lowercase text-content-muted">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginForm) {
    setServerError(undefined);
    try {
      await loginWithEmailPassword(values);
      await onSuccess();
    } catch (err) {
      setServerError((err as ApiError).message);
      toast.error((err as ApiError).message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field
        label={t('auth:login.emailLabel')}
        error={translateError(t, errors.email?.message)}
        required
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
        />
      </Field>

      <Field
        label={t('auth:login.passwordLabel')}
        error={translateError(t, errors.password?.message)}
        required
      >
        <Input
          type="password"
          autoComplete="current-password"
          placeholder={t('auth:login.passwordPlaceholder')}
          {...register('password')}
        />
      </Field>

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        {t('auth:login.submit')}
      </Button>
    </form>
  );
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'candidate' },
  });

  const selectedRole = watch('role');

  async function onSubmit(values: RegisterForm) {
    setServerError(undefined);
    try {
      await registerWithEmailPassword({
        email: values.email,
        password: values.password,
        role: values.role,
        adminInviteCode: values.adminInviteCode,
      });
      await onSuccess();
    } catch (err) {
      setServerError((err as ApiError).message);
      toast.error((err as ApiError).message);
    }
  }

  const roles: Role[] = ['candidate', 'employer', 'admin'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field
        label={t('auth:signup.emailLabel')}
        error={translateError(t, errors.email?.message)}
        required
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
        />
      </Field>

      <Field
        label={t('auth:signup.passwordLabel')}
        help={t('auth:signup.passwordHelp')}
        error={translateError(t, errors.password?.message)}
        required
      >
        <Input
          type="password"
          autoComplete="new-password"
          placeholder={t('auth:signup.passwordPlaceholder')}
          {...register('password')}
        />
      </Field>

      <Field
        label={t('auth:signup.confirmPasswordLabel')}
        error={translateError(t, errors.confirmPassword?.message)}
        required
      >
        <Input
          type="password"
          autoComplete="new-password"
          placeholder={t('auth:signup.confirmPasswordPlaceholder')}
          {...register('confirmPassword')}
        />
      </Field>

      <Field
        label={t('auth:signup.roleLabel')}
        error={translateError(t, errors.role?.message)}
        required
      >
        <NativeSelect {...register('role')}>
          {roles.map((r) => (
            <option key={r} value={r}>
              {t(`common:roles.${r}`)}
            </option>
          ))}
        </NativeSelect>
      </Field>

      {selectedRole === 'admin' && (
        <Field
          label={t('auth:signup.adminInviteCodeLabel')}
          error={translateError(t, errors.adminInviteCode?.message)}
          required
        >
          <Input
            type="password"
            autoComplete="off"
            placeholder={t('auth:signup.adminInviteCodePlaceholder')}
            {...register('adminInviteCode')}
          />
        </Field>
      )}

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        {t('auth:signup.submit')}
      </Button>
    </form>
  );
}
