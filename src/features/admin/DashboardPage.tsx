import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminDashboard } from './queries';
import { paths } from '@/routes/paths';
import { formatNumber } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ErrorState, LoadingState } from '@/components/common/States';

export function AdminDashboardPage() {
  const { t } = useTranslation('admin');
  usePageTitle(t('dashboard.title'));
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const metrics: { label: string; value: number; to?: string }[] = [
    { label: t('dashboard.metrics.candidates'), value: data.totalCandidates, to: paths.admin.candidates },
    { label: t('dashboard.metrics.employers'), value: data.totalEmployers, to: paths.admin.employers },
    { label: t('dashboard.metrics.pendingEmployers'), value: data.pendingEmployers },
    { label: t('dashboard.metrics.activeJobs'), value: data.activeJobs, to: paths.jobs },
    { label: t('dashboard.metrics.verifiedPlacements'), value: data.verifiedPlacements ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1>{t('dashboard.title')}</h1>
        <p className="text-content-muted">{t('dashboard.subtitle')}</p>
      </div>

      <section aria-label={t('dashboard.title')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => {
          const card = (
            <Card className={m.to ? 'h-full transition-shadow hover:shadow-md' : 'h-full'}>
              <CardBody>
                <p className="text-3xl font-bold text-brand-800">{formatNumber(m.value)}</p>
                <p className="text-content-muted">{m.label}</p>
              </CardBody>
            </Card>
          );
          return m.to ? (
            <Link
              key={m.label}
              to={m.to}
              className="block rounded-lg no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {card}
            </Link>
          ) : (
            <div key={m.label}>{card}</div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {data.registrationsByMonth && data.registrationsByMonth.length > 0 && (
          <ChartCard title={t('dashboard.charts.registrations')}>
            <LineChart data={data.registrationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1d4ed8" strokeWidth={2} />
            </LineChart>
          </ChartCard>
        )}

        {data.placementsByMonth && data.placementsByMonth.length > 0 && (
          <ChartCard title={t('dashboard.charts.placements')}>
            <BarChart data={data.placementsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#15803d" />
            </BarChart>
          </ChartCard>
        )}

        {data.applicationsByStatus && data.applicationsByStatus.length > 0 && (
          <ChartCard title={t('dashboard.charts.applicationsByStatus')}>
            <BarChart data={data.applicationsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {data.applicationsByStatus.map((entry) => (
                  <Cell key={entry.status} fill="#1d4ed8" />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        )}

        {data.jobsByEmployer && data.jobsByEmployer.length > 0 && (
          <ChartCard title={t('dashboard.charts.jobsByEmployer')}>
            <BarChart data={data.jobsByEmployer} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="companyName" width={130} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1d4ed8" />
            </BarChart>
          </ChartCard>
        )}

        {data.rejectionsByEmployer && data.rejectionsByEmployer.length > 0 && (
          <ChartCard title={t('dashboard.charts.rejectionsByEmployer')}>
            <BarChart data={data.rejectionsByEmployer} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="companyName" width={130} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#dc2626" />
            </BarChart>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg">{title}</h2>
      </CardHeader>
      <CardBody>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
