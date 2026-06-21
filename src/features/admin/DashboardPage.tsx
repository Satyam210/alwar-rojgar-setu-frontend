import { useTranslation } from 'react-i18next';
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
import { formatNumber } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ErrorState, LoadingState } from '@/components/common/States';

export function AdminDashboardPage() {
  const { t } = useTranslation('admin');
  usePageTitle(t('dashboard.title'));
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const metrics = [
    { label: t('dashboard.metrics.candidates'), value: data.totalCandidates },
    { label: t('dashboard.metrics.employers'), value: data.totalEmployers },
    { label: t('dashboard.metrics.pendingEmployers'), value: data.pendingEmployers },
    { label: t('dashboard.metrics.activeJobs'), value: data.activeJobs },
    { label: t('dashboard.metrics.applications'), value: data.totalApplications },
    { label: t('dashboard.metrics.placements'), value: data.totalPlacements },
    { label: t('dashboard.metrics.verifiedPlacements'), value: data.verifiedPlacements },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1>{t('dashboard.title')}</h1>
        <p className="text-content-muted">{t('dashboard.subtitle')}</p>
      </div>

      <section aria-label={t('dashboard.title')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardBody>
              <p className="text-3xl font-bold text-brand-800">{formatNumber(m.value)}</p>
              <p className="text-content-muted">{m.label}</p>
            </CardBody>
          </Card>
        ))}
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
