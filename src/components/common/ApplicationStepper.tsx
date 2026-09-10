import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { Application } from '@/api/types';

type StepKey = 'applied' | 'reviewed' | 'shortlisted' | 'interview' | 'result';
type Terminal = 'hired' | 'rejected' | null;

const STEPS: StepKey[] = ['applied', 'reviewed', 'shortlisted', 'interview', 'result'];

function getProgress(app: Application): { completed: number; terminal: Terminal } {
  if (app.status === 'hired') return { completed: 4, terminal: 'hired' };
  if (app.status === 'rejected') return { completed: 1, terminal: 'rejected' };
  const map: Record<string, number> = {
    received: 1,
    viewed: 2,
    shortlisted: 3,
    interview_scheduled: 4,
  };
  return { completed: map[app.status] ?? 1, terminal: null };
}

export function ApplicationStepper({ app }: { app: Application }) {
  const { t } = useTranslation('applications');
  const { completed, terminal } = getProgress(app);

  return (
    <nav aria-label={t('stepper.ariaLabel')} className="w-full pt-3">
      <ol className="flex items-start">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isResultStep = step === 'result';
          const isLast = i === STEPS.length - 1;

          type NodeState = 'done' | 'hired' | 'rejected' | 'pending';
          const nodeState: NodeState = isResultStep
            ? terminal === 'hired'
              ? 'hired'
              : terminal === 'rejected'
              ? 'rejected'
              : 'pending'
            : stepNum <= completed
            ? 'done'
            : 'pending';

          const connectorActive =
            !isLast &&
            (i < 3 ? completed > stepNum : terminal === 'hired' && completed >= 4);

          const nodeLabel = isResultStep
            ? terminal === 'hired'
              ? t('status.hired')
              : terminal === 'rejected'
              ? t('status.rejected')
              : t('stepper.result')
            : t(`stepper.${step}`);

          const nodeIcon =
            nodeState === 'done' || nodeState === 'hired'
              ? '✓'
              : nodeState === 'rejected'
              ? '✕'
              : String(stepNum);

          return (
            <li key={step} className="relative flex flex-1 flex-col items-center">
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute top-3 left-1/2 h-0.5 w-full',
                    connectorActive ? 'bg-brand-600' : 'bg-border',
                  )}
                />
              )}

              <div
                className={cn(
                  'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                  (nodeState === 'done' || nodeState === 'hired') &&
                    'border-brand-600 bg-brand-600 text-white',
                  nodeState === 'rejected' && 'border-danger bg-danger text-white',
                  nodeState === 'pending' && 'border-border bg-surface text-content-muted',
                )}
                aria-current={
                  !isResultStep && stepNum === completed && terminal === null ? 'step' : undefined
                }
              >
                {nodeIcon}
              </div>

              <p
                className={cn(
                  'mt-1 max-w-[4rem] text-center text-[10px] leading-tight',
                  (nodeState === 'done' || nodeState === 'hired') && 'font-medium text-brand-700',
                  nodeState === 'rejected' && 'font-medium text-danger',
                  nodeState === 'pending' && 'text-content-muted',
                )}
              >
                {nodeLabel}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
