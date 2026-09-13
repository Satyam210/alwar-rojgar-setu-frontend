import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminTestimonials, useUpdateTestimonial, useDeleteTestimonial } from './queries';
import type { Testimonial } from '@/api/types';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function AdminTestimonialsPage() {
  const { t } = useTranslation(['admin', 'common']);
  usePageTitle(t('admin:testimonials.title'));

  const { data, isLoading, isError, refetch } = useAdminTestimonials();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const testimonials = data ?? [];

  async function handleTogglePublish(item: Testimonial) {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        input: { isPublished: !item.isPublished },
      });
      toast.success(
        item.isPublished
          ? t('admin:testimonials.unpublished')
          : t('admin:testimonials.published'),
      );
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleDelete(item: Testimonial) {
    const ok = await confirmDialog({
      title: t('admin:testimonials.deleteTitle'),
      body: t('admin:testimonials.deleteConfirm', { name: item.name }),
      confirmLabel: t('common:actions.delete'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success(t('admin:testimonials.deleted'));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{t('admin:testimonials.title')}</h1>
          <p className="mt-1 text-sm text-content-muted">{t('admin:testimonials.subtitle')}</p>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {!isLoading && !isError && testimonials.length === 0 && (
        <EmptyState title={t('admin:testimonials.empty')} />
      )}

      {testimonials.length > 0 && (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                  <th className="px-4 py-3">{t('admin:testimonials.colName')}</th>
                  <th className="px-4 py-3">{t('admin:testimonials.colTrade')}</th>
                  <th className="px-4 py-3">{t('admin:testimonials.colPreview')}</th>
                  <th className="px-4 py-3">{t('admin:testimonials.colStatus')}</th>
                  <th className="px-4 py-3 text-right">{t('admin:testimonials.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {testimonials.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-content-muted">{item.trade ?? '—'}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-xs text-content-muted">{item.body}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.isPublished ? (
                        <Badge tone="success">{t('admin:testimonials.statusPublished')}</Badge>
                      ) : (
                        <Badge tone="warning">{t('admin:testimonials.statusPending')}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleTogglePublish(item)}
                          disabled={updateMutation.isPending}
                        >
                          {item.isPublished
                            ? t('admin:testimonials.unpublish')
                            : t('admin:testimonials.publish')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(item)}
                          disabled={deleteMutation.isPending}
                        >
                          {t('common:actions.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
