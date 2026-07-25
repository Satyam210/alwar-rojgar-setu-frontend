import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  loginWithEmailPassword,
  sendOtp,
  verifyOtpAndRegister,
  initiateGoogleLogin,
  forgotPassword,
  resetPassword,
} from '@/api/auth';
import { getCurrentUser } from '@/api/users';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import { translateError } from '@/lib/validation';
import type { ApiError } from '@/api/client';
import type { Role } from '@/api/types';
import {
  loginSchema,
  registerSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginForm,
  type RegisterForm,
  type OtpForm,
  type ForgotPasswordForm,
  type ResetPasswordForm,
} from './schemas';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';
import { DemoLoginPanel } from '@/components/dev/DemoLoginPanel';
import { toast } from '@/components/ui/toast';

type AuthMode = 'login' | 'signup' | 'forgot';
type SignupStep = 'form' | 'otp';
type ForgotStep = 'email' | 'otp' | 'newPassword';

const OTP_EXPIRY_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  usePageTitle(t('auth:login.title'));
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  const [mode, setMode] = useState<AuthMode>('login');
  const disabled = (location.state as { disabled?: boolean } | null)?.disabled;
  const pending = (location.state as { pending?: boolean } | null)?.pending;
  const rejected = (location.state as { rejected?: boolean } | null)?.rejected;
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
            {mode === 'login'
              ? t('auth:login.title')
              : mode === 'signup'
              ? t('auth:signup.title')
              : t('auth:forgot.title')}
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            {mode === 'login'
              ? t('auth:login.subtitle')
              : mode === 'signup'
              ? t('auth:signup.subtitle')
              : t('auth:forgot.subtitle')}
          </p>
        </div>

        {disabled && (
          <div className="mb-5 rounded-lg border border-danger/30 bg-red-50 p-3" role="alert">
            <p className="font-semibold text-danger">{t('auth:disabled.title')}</p>
            <p className="text-sm text-content">{t('auth:disabled.body')}</p>
          </div>
        )}

        {pending && (
          <div className="mb-5 rounded-lg border border-amber-300/60 bg-amber-50 p-3" role="alert">
            <p className="font-semibold text-amber-700">{t('auth:pending.title')}</p>
            <p className="text-sm text-content">{t('auth:pending.body')}</p>
          </div>
        )}

        {rejected && (
          <div className="mb-5 rounded-lg border border-danger/30 bg-red-50 p-3" role="alert">
            <p className="font-semibold text-danger">{t('auth:rejected.title')}</p>
            <p className="text-sm text-content">{t('auth:rejected.body')}</p>
          </div>
        )}

        {mode === 'login' ? (
          <>
            <GoogleAuthButton label={t('auth:login.googleButton')} />
            <AuthDivider label={t('common:common.or')} />
            <LoginForm onSuccess={completeLogin} onForgotPassword={() => setMode('forgot')} />
          </>
        ) : mode === 'signup' ? (
          <SignupFlow onSuccess={completeLogin} />
        ) : (
          <ForgotPasswordFlow onDone={() => setMode('login')} />
        )}

        {mode !== 'forgot' && (
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
        )}
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

function LoginForm({ onSuccess, onForgotPassword }: { onSuccess: () => void; onForgotPassword: () => void }) {
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
          placeholder={t('auth:login.emailPlaceholder')}
          {...register('email')}
        />
      </Field>

      <Field
        label={t('auth:login.passwordLabel')}
        error={translateError(t, errors.password?.message)}
        required
      >
        <PasswordInput
          autoComplete="current-password"
          placeholder={t('auth:login.passwordPlaceholder')}
          {...register('password')}
        />
      </Field>

      <div className="flex justify-end -mt-1">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-brand-700 underline-offset-2 hover:underline"
        >
          {t('auth:forgot.link')}
        </button>
      </div>

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

interface SignupFlowProps {
  onSuccess: () => void;
}

function SignupFlow({ onSuccess }: SignupFlowProps) {
  const { t } = useTranslation(['auth', 'common']);
  const [step, setStep] = useState<SignupStep>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPayload, setPendingPayload] = useState<RegisterForm | null>(null);

  function handleFormComplete(values: RegisterForm) {
    setPendingEmail(values.email);
    setPendingPayload(values);
    setStep('otp');
  }

  function handleChangeEmail() {
    setStep('form');
    setPendingEmail('');
    setPendingPayload(null);
  }

  if (step === 'form') {
    return (
      <>
        <GoogleAuthButton label={t('auth:signup.googleButton')} />
        <AuthDivider label={t('common:common.or')} />
        <SignupDetailsForm onComplete={handleFormComplete} />
      </>
    );
  }

  return (
    <OtpVerificationForm
      email={pendingEmail}
      registrationPayload={pendingPayload!}
      onSuccess={onSuccess}
      onChangeEmail={handleChangeEmail}
    />
  );
}

function SignupDetailsForm({ onComplete }: { onComplete: (values: RegisterForm) => void }) {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'candidate' },
  });

  async function onSubmit(values: RegisterForm) {
    setServerError(undefined);
    try {
      await sendOtp({
        email: values.email,
        password: values.password,
        role: values.role as Role,
      });
      toast.success('Verification code sent! Check your email.');
      onComplete(values);
    } catch (err) {
      const message = (err as ApiError).message;
      setServerError(message);
      toast.error(message);
    }
  }

  const roles: Role[] = ['candidate', 'employer'];

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
          placeholder={t('auth:signup.emailPlaceholder')}
          {...register('email')}
        />
      </Field>

      <Field
        label={t('auth:signup.passwordLabel')}
        help={t('auth:signup.passwordHelp')}
        error={translateError(t, errors.password?.message)}
        required
      >
        <PasswordInput
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
        <PasswordInput
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

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        {isSubmitting ? t('auth:signup.submitting') : t('auth:signup.submit')}
      </Button>
    </form>
  );
}

// ─── Forgot Password Flow ────────────────────────────────────────────────────

function ForgotPasswordFlow({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation(['auth', 'validation']);
  const [step, setStep] = useState<ForgotStep>('email');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingOtp, setPendingOtp] = useState('');

  if (step === 'email') {
    return (
      <ForgotEmailForm
        onComplete={(email) => {
          setPendingEmail(email);
          setStep('otp');
        }}
        onBack={onDone}
      />
    );
  }

  if (step === 'otp') {
    return (
      <ForgotOtpForm
        email={pendingEmail}
        onComplete={(otp) => {
          setPendingOtp(otp);
          setStep('newPassword');
        }}
        onResend={async () => { await forgotPassword(pendingEmail); }}
        onBack={() => setStep('email')}
      />
    );
  }

  return (
    <ForgotNewPasswordForm
      email={pendingEmail}
      otp={pendingOtp}
      onDone={() => {
        toast.success(t('auth:forgot.successToast'));
        onDone();
      }}
    />
  );
}

function ForgotEmailForm({
  onComplete,
  onBack,
}: {
  onComplete: (email: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation(['auth', 'validation']);
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordForm) {
    setServerError(undefined);
    try {
      await forgotPassword(values.email);
      onComplete(values.email);
    } catch (err) {
      setServerError((err as ApiError).message);
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
          placeholder={t('auth:login.emailPlaceholder')}
          {...register('email')}
        />
      </Field>

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">{serverError}</p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        {t('auth:forgot.sendCode')}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-center text-content-muted underline-offset-2 hover:underline"
      >
        {t('auth:forgot.backToLogin')}
      </button>
    </form>
  );
}

function ForgotOtpForm({
  email,
  onComplete,
  onResend,
  onBack,
}: {
  email: string;
  onComplete: (otp: string) => void;
  onResend: () => Promise<void>;
  onBack: () => void;
}) {
  const { t } = useTranslation(['auth', 'validation']);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const isExpired = timeLeft <= 0;
  const expiryMinutes = Math.floor(timeLeft / 60);
  const expirySeconds = timeLeft % 60;

  // OTP is only validated for format here; the backend verifies it atomically at reset time
  function onSubmit(values: OtpForm) {
    onComplete(values.otp);
  }

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setTimeLeft(OTP_EXPIRY_SECONDS);
      toast.success(t('auth:otp.resendSuccess'));
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown, isResending, onResend, t]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
        <p className="text-sm font-medium text-brand-800">
          {t('auth:forgot.otpSentTo', { email })}
        </p>
        {!isExpired ? (
          <p className="mt-1 text-xs text-brand-600">
            {t('auth:otp.expiresIn', {
              minutes: expiryMinutes,
              seconds: String(expirySeconds).padStart(2, '0'),
            })}
          </p>
        ) : (
          <p className="mt-1 text-xs font-medium text-danger">{t('auth:otp.expired')}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label={t('auth:otp.label')} error={translateError(t, errors.otp?.message)} required>
          <Input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder={t('auth:otp.placeholder')}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            disabled={isExpired}
            {...register('otp')}
          />
        </Field>

        <Button type="submit" block loading={isSubmitting} disabled={isExpired}>
          {t('auth:forgot.verifyCode')}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-content-muted underline-offset-2 hover:underline"
        >
          {t('auth:forgot.backToLogin')}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="font-semibold text-brand-700 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendCooldown > 0
            ? t('auth:otp.resendIn', { seconds: resendCooldown })
            : isResending
            ? '…'
            : t('auth:otp.resend')}
        </button>
      </div>
    </div>
  );
}

function ForgotNewPasswordForm({ email, otp, onDone }: { email: string; otp: string; onDone: () => void }) {
  const { t } = useTranslation(['auth', 'validation']);
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordForm) {
    setServerError(undefined);
    try {
      await resetPassword({ email, otp, newPassword: values.newPassword });
      onDone();
    } catch (err) {
      setServerError((err as ApiError).message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p className="text-sm text-content-muted">{t('auth:forgot.newPasswordSubtitle')}</p>

      <Field
        label={t('auth:forgot.newPasswordLabel')}
        help={t('auth:signup.passwordHelp')}
        error={translateError(t, errors.newPassword?.message)}
        required
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder={t('auth:forgot.newPasswordPlaceholder')}
          {...register('newPassword')}
        />
      </Field>

      <Field
        label={t('auth:forgot.confirmPasswordLabel')}
        error={translateError(t, errors.confirmPassword?.message)}
        required
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder={t('auth:signup.confirmPasswordPlaceholder')}
          {...register('confirmPassword')}
        />
      </Field>

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">{serverError}</p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        {t('auth:forgot.resetButton')}
      </Button>
    </form>
  );
}

// ─── OTP Verification (Registration) ─────────────────────────────────────────

interface OtpVerificationFormProps {
  email: string;
  registrationPayload: RegisterForm;
  onSuccess: () => void;
  onChangeEmail: () => void;
}

function OtpVerificationForm({
  email,
  registrationPayload,
  onSuccess,
  onChangeEmail,
}: OtpVerificationFormProps) {
  const { t } = useTranslation(['auth', 'validation']);
  const [serverError, setServerError] = useState<string>();
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  // Countdown for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const expiryMinutes = Math.floor(timeLeft / 60);
  const expirySeconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setServerError(undefined);
    try {
      await sendOtp({
        email,
        password: registrationPayload.password,
        role: registrationPayload.role as Role,
      });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setTimeLeft(OTP_EXPIRY_SECONDS);
      reset();
      toast.success('A new verification code has been sent.');
    } catch (err) {
      const message = (err as ApiError).message;
      setServerError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown, isResending, email, registrationPayload, reset]);

  async function onSubmit(values: OtpForm) {
    setServerError(undefined);
    try {
      await verifyOtpAndRegister({ email, otp: values.otp });
      toast.success(t('auth:otp.success'));
      onSuccess();
    } catch (err) {
      const message = (err as ApiError).message;
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
        <p className="text-sm font-medium text-brand-800">
          {t('auth:otp.subtitle', { email })}
        </p>
        {!isExpired ? (
          <p className="mt-1 text-xs text-brand-600">
            {t('auth:otp.expiresIn', {
              minutes: expiryMinutes,
              seconds: String(expirySeconds).padStart(2, '0'),
            })}
          </p>
        ) : (
          <p className="mt-1 text-xs font-medium text-danger">{t('auth:otp.expired')}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field
          label={t('auth:otp.label')}
          error={translateError(t, errors.otp?.message)}
          required
        >
          <Input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder={t('auth:otp.placeholder')}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            disabled={isExpired}
            {...register('otp')}
          />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-danger">
            {serverError}
          </p>
        )}

        <Button type="submit" block loading={isSubmitting} disabled={isExpired}>
          {isSubmitting ? t('auth:otp.submitting') : t('auth:otp.submit')}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-content-muted underline-offset-2 hover:underline"
        >
          {t('auth:otp.changeEmail')}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="font-semibold text-brand-700 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendCooldown > 0
            ? t('auth:otp.resendIn', { seconds: resendCooldown })
            : isResending
            ? '…'
            : t('auth:otp.resend')}
        </button>
      </div>
    </div>
  );
}
