import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuthStore } from '@/stores/authStore';
import {
  useAdminTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
} from './queries';
import type { Testimonial } from '@/api/types';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

interface FormState {
  name: string;
  trade: string;
  body: string;
  photoUrl: string;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  trade: '',
  body: '',
  photoUrl: '',
  isPublished: false,
};

function formFromTestimonial(t: Testimonial): FormState {
  return {
    name: t.name,
    trade: t.trade ?? '',
    body: t.body,
    photoUrl: t.photoUrl ?? '',
    isPublished: t.isPublished,
  };
}

export function AdminTestimonialsPage() {
  const { t } = useTranslation(['admin', 'common']);
  usePageTitle(t('admin:testimonials.title'));
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  const { data, isLoading, isError, refetch } = useAdminTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const testimonials = data ?? [];

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError('');
    setAdding(true);
    setEditing(null);
  }

  function openEdit(item: Testimonial) {
    setForm(formFromTestimonial(item));
    setFormError('');
    setEditing(item);
    setAdding(false);
  }

  function closeModal() {
    setAdding(false);
    setEditing(null);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.body.trim()) {
      setFormError(t('admin:testimonials.validationRequired'));
      return;
    }
    const payload = {
      name: form.name.trim(),
      trade: form.trade.trim() || null,
      body: form.body.trim(),
      photoUrl: form.photoUrl.trim() || null,
      isPublished: form.isPublished,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload });
        toast.success(t('admin:testimonials.updated'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('admin:testimonials.created'));
      }
      closeModal();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

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

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const modalOpen = adding || !!editing;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1>{t('admin:testimonials.title')}</h1>
        {isAdmin && (
          <Button onClick={openAdd}>{t('admin:testimonials.add')}</Button>
        )}
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
                  <th className="px-4 py-3">{t('admin:testimonials.colStatus')}</th>
                  <th className="px-4 py-3 text-right">{t('admin:testimonials.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {testimonials.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-content-muted">{item.trade ?? '—'}</td>
                    <td className="px-4 py-3">
                      {item.isPublished ? (
                        <Badge tone="success">{t('admin:testimonials.statusPublished')}</Badge>
                      ) : (
                        <Badge tone="neutral">{t('admin:testimonials.statusDraft')}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
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
                          <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                            {t('common:actions.edit')}
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
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={(open) => { if (!open) closeModal(); }}
        title={editing ? t('admin:testimonials.editTitle') : t('admin:testimonials.addTitle')}
      >
        <div className="flex flex-col gap-4">
          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <Field label={t('admin:testimonials.fieldName')} required>
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Rahul Sharma"
            />
          </Field>

          <Field label={t('admin:testimonials.fieldTrade')}>
            <Input
              value={form.trade}
              onChange={(e) => setField('trade', e.target.value)}
              placeholder="Electrician"
            />
          </Field>

          <Field label={t('admin:testimonials.fieldBody')} required>
            <Textarea
              value={form.body}
              onChange={(e) => setField('body', e.target.value)}
              rows={4}
              placeholder={t('admin:testimonials.fieldBodyPlaceholder')}
            />
          </Field>

          <Field label={t('admin:testimonials.fieldPhoto')}>
            <Input
              value={form.photoUrl}
              onChange={(e) => setField('photoUrl', e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setField('isPublished', e.target.checked)}
              className="h-4 w-4 rounded border-border accent-brand-600"
            />
            {t('admin:testimonials.fieldPublish')}
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>
              {t('common:actions.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('common:actions.saving') : t('common:actions.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
