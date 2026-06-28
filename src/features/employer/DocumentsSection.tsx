import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { EmployerDocumentType } from '@/api/types';
import { uploadEmployerDocument } from '@/api/employer';
import { fetchDocumentBlobUrl } from '@/api/documents';
import { employerKeys, useDeleteEmployerDocument, useEmployerDocuments } from './queries';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { NativeSelect } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { DocumentStatusBadge } from '@/components/common/StatusBadge';
import { EmptyState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

const DOC_TYPES: EmployerDocumentType[] = [
  'GST_CERTIFICATE',
  'UDYAM_CERTIFICATE',
  'FACTORY_LICENSE',
  'PAN_CARD',
  'OTHER',
];

export function EmployerDocumentsSection() {
  const { t } = useTranslation('employer');
  const qc = useQueryClient();
  const { data: docs, isLoading } = useEmployerDocuments();
  const del = useDeleteEmployerDocument();
  const [docType, setDocType] = useState<EmployerDocumentType>('GST_CERTIFICATE');

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg">{t('documents.title')}</h2>
        <p className="mt-1 text-content-muted">{t('documents.subtitle')}</p>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <Field label={t('documents.type')}>
              <NativeSelect
                value={docType}
                onChange={(e) => setDocType(e.target.value as EmployerDocumentType)}
              >
                {DOC_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`documents.types.${type}`)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <FileUpload
            label={t('documents.upload')}
            onUpload={(file, onProgress) => uploadEmployerDocument(file, docType, onProgress)}
            onSuccess={() => {
              toast.success(t('profile.saved'));
              qc.invalidateQueries({ queryKey: employerKeys.documents() });
            }}
            onError={(m) => toast.error(m)}
          />
        </div>

        {isLoading && <LoadingState />}
        {docs && docs.length === 0 && <EmptyState body={t('documents.empty')} />}
        {docs && docs.length > 0 && (
          <ul className="flex flex-col gap-2">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded border border-border p-3"
              >
                <div>
                  <p className="font-medium">{t(`documents.types.${doc.documentType}`)}</p>
                  <button
                    type="button"
                    className="text-sm text-brand-700 hover:underline"
                    onClick={async () => {
                      const blobUrl = await fetchDocumentBlobUrl(doc.documentUrl);
                      if (blobUrl) window.open(blobUrl, '_blank', 'noreferrer');
                    }}
                  >
                    {t('common:actions.view', { defaultValue: 'View' })}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <DocumentStatusBadge status={doc.verificationStatus} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(t('documents.deleteConfirm'))) del.mutate(doc.id);
                    }}
                  >
                    {t('actions.delete', { ns: 'common', defaultValue: 'Delete' })}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
