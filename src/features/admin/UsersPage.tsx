import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdmins, useAdminInvites, useGrantAdminAccess, useCancelAdminInvite } from './queries';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

const grantSchema = z.object({ email: z.string().trim().email() });
type GrantForm = z.infer<typeof grantSchema>;

export function AdminUsersPage() {
  const { t } = useTranslation(['admin', 'common']);
  usePageTitle(t('admin:users.title'));

  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdmins({ page, limit: PAGE_SIZE });
  const invites = useAdminInvites();
  const grant = useGrantAdminAccess();
  const cancelInvite = useCancelAdminInvite();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GrantForm>({ resolver: zodResolver(grantSchema) });

  function onSubmit(values: GrantForm) {
    grant.mutate(values.email, {
      onSuccess: (result) => {
        toast.success(
          result.kind === 'promoted'
            ? t('admin:users.grantPromoted', { email: result.user.email })
            : t('admin:users.grantInvited', { email: result.invite.email }),
        );
        reset();
      },
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  }

  async function handleCancelInvite(id: string, email: string) {
    const ok = await confirmDialog({
      title: t('admin:users.cancelInvite'),
      body: t('admin:users.cancelInviteConfirm', { email }),
      confirmLabel: t('admin:users.cancelInvite'),
      destructive: true,
    });
    if (!ok) return;
    cancelInvite.mutate(id, {
      onSuccess: () => toast.success(t('admin:users.inviteCancelled')),
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  }

  const rows = data?.data ?? [];
  const inviteRows = invites.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1>{t('admin:users.title')}</h1>
        <p className="text-content-muted">{t('admin:users.subtitle')}</p>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{t('admin:users.grantTitle')}</h2>
          <p className="text-sm text-content-muted">{t('admin:users.grantSubtitle')}</p>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3" noValidate>
            <div className="w-72">
              <Field label={t('admin:users.grantEmailLabel')} error={errors.email?.message}>
                <Input type="email" placeholder="name@example.com" {...register('email')} />
              </Field>
            </div>
            <Button type="submit" loading={isSubmitting || grant.isPending}>
              {t('admin:users.grantSubmit')}
            </Button>
          </form>
        </CardBody>
      </Card>

      {inviteRows.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{t('admin:users.pendingInvitesTitle')}</h2>
          <ul className="flex flex-col gap-3">
            {inviteRows.map((invite) => (
              <li key={invite.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{invite.email}</p>
                      <p className="text-xs text-content-muted">
                        {t('admin:users.invitedOn')} {formatDate(invite.createdAt)}
                        {invite.invitedByEmail
                          ? ` · ${t('admin:users.invitedBy')} ${invite.invitedByEmail}`
                          : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id, invite.email)}
                    >
                      {t('admin:users.cancelInvite')}
                    </Button>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">{t('admin:users.currentAdminsTitle')}</h2>

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={refetch} />}
        {data && rows.length === 0 && <EmptyState title={t('admin:users.empty')} />}

        {data && rows.length > 0 && (
          <>
            <ul className="flex flex-col gap-3">
              {rows.map((row) => (
                <li key={row.userId}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">{row.name || row.email}</h3>
                        <p className="text-sm text-content-muted">{row.email}</p>
                      </div>
                      {row.createdAt && (
                        <p className="text-xs text-content-muted">
                          {t('admin:users.adminSince')} {formatDate(row.createdAt)}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
