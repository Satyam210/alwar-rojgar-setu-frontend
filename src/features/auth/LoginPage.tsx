import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { requestAdminAccess, requestOtp, verifyOtp } from '@/api/auth';
import { getCurrentUser } from '@/api/users';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import { translateError } from '@/lib/validation';
import type { ApiError } from '@/api/client';
import type { Role } from '@/api/types';
import {
  phoneSchema,
  requestOtpSchema,
  verifyOtpSchema,
  toE164,
  type RequestOtpForm,
  type VerifyOtpForm,
} from './schemas';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useResendTimer } from './useResendTimer';
import { env } from '@/config/env';
import { DemoLoginPanel } from '@/components/dev/DemoLoginPanel';
import { toast } from '@/components/ui/toast';

type Step = 'phone' | 'otp';

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  usePageTitle(t('auth:login.title'));
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('candidate');
  const [adminCode, setAdminCode] = useState<string>('');
  const disabled = (location.state as { disabled?: boolean } | null)?.disabled;
  const from = (location.state as { from?: string } | null)?.from;

  function onOtpRequested(value: string, selectedRole: Role, code?: string) {
    setPhone(value);
    setRole(selectedRole);
    setAdminCode(code ?? '');
    setStep('otp');
  }

  async function completeLogin() {
    const user = await getCurrentUser();
    setUser(user);
    navigate(from ?? postLoginPath(user.role, isProfileComplete(user)), { replace: true });
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <h1>{t('auth:login.title')}</h1>
        </CardHeader>
        <CardBody>
          {env.useMocks && <DemoLoginPanel />}

          {disabled && (
            <div className="mb-4 rounded border border-danger/30 bg-red-50 p-3" role="alert">
              <p className="font-semibold text-danger">{t('auth:disabled.title')}</p>
              <p className="text-sm text-content">{t('auth:disabled.body')}</p>
            </div>
          )}

          {step === 'phone' ? (
            <PhoneStep onRequested={onOtpRequested} />
          ) : (
            <OtpStep
              phone={phone}
              role={role}
              adminCode={adminCode}
              onVerified={completeLogin}
              onChangeNumber={() => setStep('phone')}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function PhoneStep({
  onRequested,
}: {
  onRequested: (phone: string, role: Role, adminCode?: string) => void;
}) {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const [serverError, setServerError] = useState<string>();
  const [requestingAdmin, setRequestingAdmin] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { role: 'candidate' },
  });

  const selectedRole = watch('role');

  if (requestingAdmin) {
    return <AdminAccessRequestForm onDone={() => setRequestingAdmin(false)} />;
  }

  async function onSubmit(values: RequestOtpForm) {
    setServerError(undefined);
    try {
      await requestOtp({ phone: toE164(values.phone), role: values.role });
      onRequested(values.phone, values.role, values.adminCode);
    } catch (err) {
      setServerError((err as ApiError).message);
    }
  }

  const roles: Role[] = ['candidate', 'employer', 'admin'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p className="text-content-muted">{t('auth:login.subtitle')}</p>

      <Field
        label={t('auth:login.phoneLabel')}
        help={t('auth:login.phoneHelp')}
        error={translateError(t, errors.phone?.message)}
        required
      >
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={t('auth:login.phonePlaceholder')}
          {...register('phone')}
        />
      </Field>

      <Field
        label={t('auth:login.roleLabel')}
        help={t('auth:login.roleHelp')}
        error={translateError(t, errors.role?.message)}
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
          label={t('auth:login.adminCodeLabel')}
          help={t('auth:login.adminCodeHelp')}
          error={translateError(t, errors.adminCode?.message)}
        >
          <Input
            type="password"
            autoComplete="off"
            placeholder={t('auth:login.adminCodePlaceholder')}
            {...register('adminCode')}
          />
        </Field>
      )}

      {selectedRole === 'admin' && (
        <button
          type="button"
          className="self-start text-sm font-medium text-brand-700 hover:underline"
          onClick={() => setRequestingAdmin(true)}
        >
          {t('auth:adminRequest.link')}
        </button>
      )}

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        {t('auth:login.sendOtp')}
      </Button>
    </form>
  );
}

function AdminAccessRequestForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(undefined);
    setPhoneError(undefined);

    const parsed = phoneSchema.safeParse(phone.trim());
    if (!parsed.success) {
      setPhoneError(translateError(t, parsed.error.errors[0]?.message));
      return;
    }

    setSubmitting(true);
    try {
      await requestAdminAccess({ name: name.trim(), phone: toE164(phone) });
      toast.success(t('auth:adminRequest.success'));
      onDone();
    } catch (err) {
      setServerError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <p className="font-semibold">{t('auth:adminRequest.title')}</p>
        <p className="text-sm text-content-muted">{t('auth:adminRequest.help')}</p>
      </div>

      <Field label={t('auth:adminRequest.nameLabel')} required>
        <Input
          value={name}
          autoComplete="name"
          placeholder={t('auth:adminRequest.namePlaceholder')}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field
        label={t('auth:adminRequest.phoneLabel')}
        help={t('auth:login.phoneHelp')}
        error={phoneError}
        required
      >
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={t('auth:login.phonePlaceholder')}
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setPhoneError(undefined); }}
        />
      </Field>

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" block loading={submitting} disabled={!name.trim() || !phone.trim()}>
        {t('auth:adminRequest.submit')}
      </Button>
      <button type="button" className="text-sm text-content-muted hover:underline" onClick={onDone}>
        {t('auth:adminRequest.cancel')}
      </button>
    </form>
  );
}

function OtpStep({
  phone,
  role,
  adminCode,
  onVerified,
  onChangeNumber,
}: {
  phone: string;
  role: Role;
  adminCode?: string;
  onVerified: () => Promise<void>;
  onChangeNumber: () => void;
}) {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const [serverError, setServerError] = useState<string>();
  const { seconds, restart } = useResendTimer(30);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpForm>({ resolver: zodResolver(verifyOtpSchema) });

  async function onSubmit(values: VerifyOtpForm) {
    setServerError(undefined);
    try {
      await verifyOtp({ phone: toE164(phone), otp: values.otp, role, adminCode });
      await onVerified();
    } catch (err) {
      setServerError((err as ApiError).message);
    }
  }

  async function resend() {
    try {
      await requestOtp({ phone: toE164(phone) });
      restart();
    } catch (err) {
      setServerError((err as ApiError).message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p className="text-content-muted">{t('auth:otp.subtitle', { phone })}</p>

      <Field
        label={t('auth:otp.label')}
        help={t('auth:otp.help')}
        error={translateError(t, errors.otp?.message)}
        required
      >
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={t('auth:otp.placeholder')}
          {...register('otp')}
        />
      </Field>

      {serverError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" block loading={isSubmitting}>
        {t('auth:otp.verify')}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button type="button" className="text-brand-700 hover:underline" onClick={onChangeNumber}>
          {t('auth:otp.changeNumber')}
        </button>
        {seconds > 0 ? (
          <span className="text-content-muted">{t('auth:otp.resendIn', { seconds })}</span>
        ) : (
          <button type="button" className="text-brand-700 hover:underline" onClick={resend}>
            {t('auth:otp.resend')}
          </button>
        )}
      </div>

      <button
        type="button"
        className="text-sm text-content-muted hover:underline"
        onClick={resend}
      >
        {t('auth:otp.callMe')}
      </button>
    </form>
  );
}
