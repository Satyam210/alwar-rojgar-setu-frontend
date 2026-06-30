import { useTranslation } from 'react-i18next';
import type { CandidateProfile, CertificateType } from '@/api/types';
import {
  uploadAadhaar,
  uploadCertificate,
  uploadResume,
} from '@/api/candidate';
import { fetchDocumentBlobUrl } from '@/api/documents';
import { useQueryClient } from '@tanstack/react-query';
import { candidateKeys } from './queries';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { Badge } from '@/components/ui/Badge';
import { UPLOAD_LIMITS } from '@/lib/constants';
import { toast } from '@/components/ui/toast';

export function DocumentsSection({ profile }: { profile: CandidateProfile }) {
  const { t } = useTranslation('candidate');
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: candidateKeys.profile() });

  const certificates: { type: CertificateType; label: string; url?: string | null }[] = [
    { type: 'ITI_CERTIFICATE', label: t('documents.itiCertificate'), url: profile.itiCertificateUrl },
    {
      type: 'DIPLOMA_CERTIFICATE',
      label: t('documents.diplomaCertificate'),
      url: profile.diplomaCertificateUrl,
    },
    {
      type: 'DEGREE_CERTIFICATE',
      label: t('documents.degreeCertificate'),
      url: profile.degreeCertificateUrl,
    },
    {
      type: 'EXPERIENCE_LETTER',
      label: t('documents.experienceLetter'),
      url: profile.experienceLetterUrl,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg">{t('profile.sections.documents')}</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-5">
        <DocRow label={t('documents.resume')} url={profile.resumeUrl}>
          <FileUpload
            label={t('documents.resume')}
            onUpload={(file, onProgress) => uploadResume(file, onProgress)}
            onSuccess={() => {
              toast.success(t('profile.saved'));
              refresh();
            }}
          />
        </DocRow>

        <DocRow
          label={t('documents.aadhaar')}
          url={profile.aadhaarUrl}
          extra={
            profile.aadhaarVerified ? (
              <Badge tone="success" icon="✓">
                {t('documents.aadhaarVerified')}
              </Badge>
            ) : undefined
          }
        >
          <FileUpload
            label={t('documents.aadhaar')}
            accept={UPLOAD_LIMITS.acceptDocs}
            onUpload={(file, onProgress) => uploadAadhaar(file, onProgress)}
            onSuccess={refresh}
          />
        </DocRow>

        {certificates.map((cert) => (
          <DocRow key={cert.type} label={cert.label} url={cert.url}>
            <FileUpload
              label={t('actions.upload', { ns: 'common', defaultValue: 'Upload' })}
              onUpload={(file, onProgress) => uploadCertificate(file, cert.type, onProgress)}
              onSuccess={refresh}
            />
          </DocRow>
        ))}
      </CardBody>
    </Card>
  );
}

function DocRow({
  label,
  url,
  extra,
  children,
}: {
  label: string;
  url?: string | null;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useTranslation('candidate');
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-content-muted">
          {url ? (
            <button
              type="button"
              className="text-brand-700 hover:underline"
              onClick={async () => {
                const blobUrl = await fetchDocumentBlobUrl(url);
                if (blobUrl) window.open(blobUrl, '_blank', 'noreferrer');
              }}
            >
              {t('documents.view')}
            </button>
          ) : (
            t('documents.notUploaded')
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {children}
      </div>
    </div>
  );
}
