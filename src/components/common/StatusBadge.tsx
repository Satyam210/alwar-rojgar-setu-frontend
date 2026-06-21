import { useTranslation } from 'react-i18next';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import type {
  ApplicationStatus,
  DocumentVerificationStatus,
  EmployerStatus,
  JobStatus,
} from '@/api/types';

/** Application status — text + icon so it's never colour-only (WCAG 1.4.1). */
const applicationTone: Record<ApplicationStatus, { tone: BadgeProps['tone']; icon: string }> = {
  received: { tone: 'neutral', icon: '•' },
  viewed: { tone: 'info', icon: '👁' },
  shortlisted: { tone: 'success', icon: '★' },
  rejected: { tone: 'danger', icon: '✕' },
  hired: { tone: 'success', icon: '✓' },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useTranslation('applications');
  const { tone, icon } = applicationTone[status];
  return (
    <Badge tone={tone} icon={icon}>
      {t(`status.${status}`)}
    </Badge>
  );
}

const employerTone: Record<EmployerStatus, { tone: BadgeProps['tone']; icon: string }> = {
  pending: { tone: 'warning', icon: '⏳' },
  verified: { tone: 'success', icon: '✓' },
  rejected: { tone: 'danger', icon: '✕' },
};

export function EmployerStatusBadge({ status }: { status: EmployerStatus }) {
  const { t } = useTranslation('employer');
  const { tone, icon } = employerTone[status];
  return (
    <Badge tone={tone} icon={icon}>
      {t(`verification.${status}`)}
    </Badge>
  );
}

const jobTone: Record<JobStatus, { tone: BadgeProps['tone']; icon: string }> = {
  draft: { tone: 'neutral', icon: '✎' },
  active: { tone: 'success', icon: '✓' },
  closed: { tone: 'neutral', icon: '■' },
  filled: { tone: 'info', icon: '✓' },
  expired: { tone: 'warning', icon: '⌛' },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { t } = useTranslation('jobs');
  const { tone, icon } = jobTone[status];
  return (
    <Badge tone={tone} icon={icon}>
      {t(`status.${status}`)}
    </Badge>
  );
}

const docTone: Record<DocumentVerificationStatus, { tone: BadgeProps['tone']; icon: string }> = {
  pending: { tone: 'warning', icon: '⏳' },
  verified: { tone: 'success', icon: '✓' },
  rejected: { tone: 'danger', icon: '✕' },
};

export function DocumentStatusBadge({ status }: { status: DocumentVerificationStatus }) {
  const { t } = useTranslation('employer');
  const { tone, icon } = docTone[status];
  return (
    <Badge tone={tone} icon={icon}>
      {t(`documents.verificationStatus.${status}`)}
    </Badge>
  );
}
