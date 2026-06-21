import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUpdateApplicationStatus } from '@/features/applications/queries';
import { useJob, useJobApplicants } from '@/features/jobs/queries';
import { paths } from '@/routes/paths';
import { formatCurrency, formatDate, formatExperience } from '@/lib/format';
import type { Application } from '@/api/types';
import type { UpdateApplicationStatusPayload } from '@/api/applications';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, Textarea } from '@/components/ui/Input';
import { ApplicationStatusBadge } from '@/components/common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { toast } from '@/components/ui/toast';

export function EmployerApplicantsPage() {
  const { t } = useTranslation(['applications', 'candidate', 'common']);
  const { jobId } = useParams();
  const { data: job } = useJob(jobId);
  const { data, isLoading, isError, refetch } = useJobApplicants(jobId);
  const updateStatus = useUpdateApplicationStatus(jobId ?? '');
  const [rejecting, setRejecting] = useState<Application | null>(null);
  const [reason, setReason] = useState('');
  const [hiring, setHiring] = useState<Application | null>(null);
  const [joiningDate, setJoiningDate] = useState('');
  const [attributed, setAttributed] = useState(true);

  usePageTitle(t('applications:employer.applicantsTitle'));

  function setStatus(
    app: Application,
    status: Application['status'],
    extra?: Partial<UpdateApplicationStatusPayload>,
  ) {
    updateStatus.mutate(
      { applicationId: app.id, payload: { status, ...extra } },
      {
        onSuccess: () => {
          toast.success(t('applications:employer.statusUpdated'));
          setRejecting(null);
          setReason('');
          setHiring(null);
          setJoiningDate('');
          setAttributed(true);
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  }

  function openHire(app: Application) {
    setJoiningDate('');
    setAttributed(true);
    setHiring(app);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to={paths.employer.jobs} className="text-sm">
          ← {t('common:actions.back')}
        </Link>
        <h1 className="mt-2">
          {job
            ? t('applications:employer.applicantsFor', { title: job.title })
            : t('applications:employer.applicantsTitle')}
        </h1>
        {data && (
          <p className="text-content-muted" aria-live="polite">
            {t('applications:employer.totalApplicants', { count: data.total })}
          </p>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}
      {data && data.data.length === 0 && (
        <EmptyState
          title={t('applications:employer.empty')}
          body={t('applications:employer.emptyBody')}
        />
      )}

      {data && data.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.data.map((app) => {
            const c = app.candidate;
            return (
              <li key={app.id}>
                <Card>
                  <CardBody className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold">{c?.fullName ?? '—'}</h2>
                        <p className="text-sm text-content-muted">
                          {[c?.itiTrade, c?.highestEducation].filter(Boolean).join(' · ') || '—'}
                        </p>
                        <p className="text-sm text-content-muted">
                          {t('candidate:fields.workExperienceMonths')}:{' '}
                          {formatExperience(c?.workExperienceMonths)}
                          {c?.expectedSalary
                            ? ` · ${t('candidate:fields.expectedSalary')}: ${formatCurrency(c.expectedSalary)}`
                            : ''}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>

                    {/* Contact details — candidate adds email; employer contacts directly (HLD #5). */}
                    {(app.status === 'shortlisted' || app.status === 'hired') && c?.email && (
                      <p className="text-sm">
                        {t('applications:employer.contact')}:{' '}
                        <a href={`mailto:${c.email}`}>{c.email}</a>
                      </p>
                    )}

                    {/* Hire attribution — proof the placement happened via the platform. */}
                    {app.status === 'hired' && app.attributedToPlatform && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="success" icon="✓">
                          {t('applications:employer.hiredViaPlatform')}
                        </Badge>
                        {app.joiningDate && (
                          <span className="text-sm text-content-muted">
                            {t('applications:employer.joiningOn', {
                              date: formatDate(app.joiningDate),
                            })}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {app.status !== 'shortlisted' && app.status !== 'hired' && (
                        <Button size="sm" onClick={() => setStatus(app, 'shortlisted')}>
                          {t('applications:employer.shortlist')}
                        </Button>
                      )}
                      {app.status !== 'hired' && (
                        <Button variant="secondary" size="sm" onClick={() => openHire(app)}>
                          {t('applications:employer.markHired')}
                        </Button>
                      )}
                      {app.status !== 'rejected' && (
                        <Button variant="ghost" size="sm" onClick={() => setRejecting(app)}>
                          {t('applications:employer.reject')}
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={Boolean(rejecting)}
        onOpenChange={(o) => !o && setRejecting(null)}
        title={t('applications:employer.rejectTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              loading={updateStatus.isPending}
              onClick={() => rejecting && setStatus(rejecting, 'rejected', { reason })}
            >
              {t('applications:employer.reject')}
            </Button>
          </>
        }
      >
        <Field label={t('applications:employer.rejectReason')}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Modal>

      <Modal
        open={Boolean(hiring)}
        onOpenChange={(o) => !o && setHiring(null)}
        title={t('applications:employer.hireTitle')}
        description={t('applications:employer.hireBody')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setHiring(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              loading={updateStatus.isPending}
              onClick={() =>
                hiring &&
                setStatus(hiring, 'hired', {
                  attributedToPlatform: attributed,
                  joiningDate: joiningDate || undefined,
                })
              }
            >
              {t('applications:employer.confirmHire')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label={t('applications:employer.joiningDate')}>
            <Input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
            />
          </Field>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={attributed}
              onChange={(e) => setAttributed(e.target.checked)}
            />
            <span>
              {t('applications:employer.attributedLabel')}
              <span className="mt-0.5 block text-content-muted">
                {t('applications:employer.attributedHelp')}
              </span>
            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
