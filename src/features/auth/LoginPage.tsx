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
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  type LoginForm,
  type RegisterForm,
} from './schemas';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
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
      <Card>
        <CardHeader>
          <div className="flex gap-2 border-b border-border pb-4">
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-2 font-medium transition-colors ${
                mode === 'login' ? 'border-b-2 border-brand-700 text-brand-700' : 'text-content-muted'
              }`}
            >
              {t('auth:login.title')}
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-4 py-2 font-medium transition-colors ${
                mode === 'signup' ? 'border-b-2 border-brand-700 text-brand-700' : 'text-content-muted'
              }`}
            >
              {t('auth:signup.title')}
            </button>
          </div>
        </CardHeader>
        <CardBody>
          {env.useMocks && <DemoLoginPanel />}

          {disabled && (
            <div className="mb-4 rounded border border-danger/30 bg-red-50 p-3" role="alert">
              <p className="font-semibold text-danger">{t('auth:disabled.title')}</p>
              <p className="text-sm text-content">{t('auth:disabled.body')}</p>
            </div>
          )}

          {mode === 'login' ? (
            <LoginForm onSuccess={completeLogin} />
          ) : (
            <SignupForm onSuccess={completeLogin} />
          )}
        </CardBody>
      </Card>
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
      toast({ type: 'error', message: (err as ApiError).message });
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

      <div className="relative flex items-center gap-2 before:flex-1 before:border-t before:border-border after:flex-1 after:border-t after:border-border">
        <span className="text-xs text-content-muted">{t('auth:common.or')}</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        block
        onClick={() => initiateGoogleLogin()}
      >
        {t('auth:login.googleButton')}
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
      toast({ type: 'error', message: (err as ApiError).message });
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

      <div className="relative flex items-center gap-2 before:flex-1 before:border-t before:border-border after:flex-1 after:border-t after:border-border">
        <span className="text-xs text-content-muted">{t('auth:common.or')}</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        block
        onClick={() => initiateGoogleLogin()}
      >
        {t('auth:signup.googleButton')}
      </Button>
    </form>
  );
}
