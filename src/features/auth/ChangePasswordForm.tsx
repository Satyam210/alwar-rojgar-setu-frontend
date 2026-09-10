import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { changePassword } from '@/api/auth';
import { translateError, vmsg } from '@/lib/validation';
import { apiErrorMessage } from '@/lib/errors';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';

const schema = z
  .object({
    currentPassword: z.string().min(1, vmsg('required')),
    newPassword: z.string().min(8, vmsg('minLength', { count: 8 })),
    confirmPassword: z.string().min(1, vmsg('required')),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: vmsg('passwordMismatch'),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: vmsg('passwordSameAsCurrent'),
  });

type ChangePasswordFields = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFields>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFields) =>
      changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success(t('auth:changePassword.success'));
      reset();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex max-w-md flex-col gap-4"
      noValidate
    >
      <Field
        label={t('auth:changePassword.current')}
        error={translateError(t, errors.currentPassword?.message)}
        required
      >
        <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
      </Field>
      <Field
        label={t('auth:changePassword.new')}
        help={t('auth:changePassword.newHelp')}
        error={translateError(t, errors.newPassword?.message)}
        required
      >
        <Input type="password" autoComplete="new-password" {...register('newPassword')} />
      </Field>
      <Field
        label={t('auth:changePassword.confirm')}
        error={translateError(t, errors.confirmPassword?.message)}
        required
      >
        <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
      </Field>
      <div>
        <Button type="submit" loading={mutation.isPending}>
          {t('auth:changePassword.submit')}
        </Button>
      </div>
    </form>
  );
}
