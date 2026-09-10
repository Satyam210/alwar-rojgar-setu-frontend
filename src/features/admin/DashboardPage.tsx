import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminDashboard } from './queries';
import { paths } from '@/routes/paths';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ErrorState, LoadingState } from '@/components/common/States';

type Accent = 'brand' | 'saffron' | 'amber' | 'sky' | 'emerald';

const ACCENTS: Record<Accent, { chip: string; bar: string }> = {
  brand: { chip: 'bg-brand-100 text-brand-700', bar: 'from-brand-500 to-brand-700' },
  saffron: { chip: 'bg-accent-100 text-accent-700', bar: 'from-accent-500 to-accent-600' },
  amber: { chip: 'bg-amber-100 text-amber-700', bar: 'from-amber-400 to-amber-600' },
  sky: { chip: 'bg-sky-100 text-sky-700', bar: 'from-sky-400 to-sky-600' },
  emerald: { chip: 'bg-emerald-100 text-emerald-700', bar: 'from-emerald-400 to-emerald-600' },
};

// Chart palette drawn from the brand/semantic tokens.
const NAVY = '#1E378A';
const NAVY_LIGHT = '#526DC4';
const SAFFRON = '#F57C00';
const GREEN = '#15803D';
const RED = '#B91C1C';

const STATUS_COLORS: Record<string, string> = {
  received: NAVY_LIGHT,
  viewed: NAVY,
  shortlisted: SAFFRON,
  rejected: RED,
  hired: GREEN,
};

const AXIS_TICK = { fontSize: 12, fill: '#64748b' };

export function AdminDashboardPage() {
  const { t } = useTranslation('admin');
  usePageTitle(t('dashboard.title'));
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const metrics: {
    label: string;
    value: number;
    to?: string;
    icon: string;
    accent: Accent;
  }[] = [
    { label: t('dashboard.metrics.candidates'), value: data.totalCandidates, to: paths.admin.candidates, icon: '👥', accent: 'brand' },
    { label: t('dashboard.metrics.employers'), value: data.totalEmployers, to: paths.admin.employers, icon: '🏢', accent: 'saffron' },
    { label: t('dashboard.metrics.pendingEmployers'), value: data.pendingEmployers, icon: '⏳', accent: 'amber' },
    { label: t('dashboard.metrics.activeJobs'), value: data.activeJobs, to: paths.jobs, icon: '💼', accent: 'sky' },
    { label: t('dashboard.metrics.verifiedPlacements'), value: data.verifiedPlacements ?? 0, icon: '✅', accent: 'emerald' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1>{t('dashboard.title')}</h1>
        <p className="text-content-muted">{t('dashboard.subtitle')}</p>
      </div>

      <section aria-label={t('dashboard.title')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((m) => {
          const accent = ACCENTS[m.accent];
          const card = (
            <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accent.bar)} />
              <span
                aria-hidden
                className={cn('grid h-11 w-11 place-items-center rounded-xl text-xl', accent.chip)}
              >
                {m.icon}
              </span>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-content">
                {formatNumber(m.value)}
              </p>
              <p className="text-sm text-content-muted">{m.label}</p>
            </div>
          );
          return m.to ? (
            <Link
              key={m.label}
              to={m.to}
              className="block rounded-2xl no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {card}
            </Link>
          ) : (
            <div key={m.label}>{card}</div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {data.applicationsByStatus && data.applicationsByStatus.length > 0 && (
          <ChartCard title={t('dashboard.charts.applicationsByStatus')} accent="brand">
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={data.applicationsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={84}
                paddingAngle={2}
                stroke="none"
              >
                {data.applicationsByStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? NAVY} />
                ))}
                <Label
                  content={
                    <DonutCenter
                      total={data.applicationsByStatus.reduce((sum, s) => sum + s.count, 0)}
                      caption={t('dashboard.metrics.applications')}
                    />
                  }
                />
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={9}
                formatter={(value: string) => (
                  <span className="text-xs capitalize text-content-muted">{value}</span>
                )}
              />
            </PieChart>
          </ChartCard>
        )}

        {data.jobsByEmployer && data.jobsByEmployer.length > 0 && (
          <ChartCard title={t('dashboard.charts.jobsByEmployer')} accent="saffron">
            <BarChart
              data={data.jobsByEmployer}
              layout="vertical"
              margin={{ top: 4, right: 28, bottom: 4, left: 8 }}
            >
              <defs>
                <linearGradient id="gradJobs" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={SAFFRON} stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#fb8c00" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="#eef1f6" />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="companyName"
                width={140}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#334155' }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill="url(#gradJobs)" radius={[0, 8, 8, 0]} maxBarSize={22}>
                <LabelList dataKey="count" position="right" fontSize={12} fill="#475569" />
              </Bar>
            </BarChart>
          </ChartCard>
        )}

        {data.registrationsByMonth && data.registrationsByMonth.length > 0 && (
          <ChartCard title={t('dashboard.charts.registrations')} accent="brand">
            <AreaChart data={data.registrationsByMonth} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="gradReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NAVY} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef1f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_TICK} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={NAVY}
                strokeWidth={2.5}
                fill="url(#gradReg)"
                dot={{ r: 3, fill: NAVY, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartCard>
        )}

        {data.placementsByMonth && data.placementsByMonth.length > 0 && (
          <ChartCard title={t('dashboard.charts.placements')} accent="emerald">
            <LineChart data={data.placementsByMonth} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef1f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_TICK} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={GREEN}
                strokeWidth={2.5}
                dot={{ r: 3, fill: GREEN, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartCard>
        )}

        {data.rejectionsByEmployer && data.rejectionsByEmployer.length > 0 && (
          <ChartCard title={t('dashboard.charts.rejectionsByEmployer')} accent="rose">
            <BarChart
              data={data.rejectionsByEmployer}
              layout="vertical"
              margin={{ top: 4, right: 28, bottom: 4, left: 8 }}
            >
              <defs>
                <linearGradient id="gradRej" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.85} />
                  <stop offset="100%" stopColor={RED} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="#eef1f6" />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="companyName"
                width={140}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#334155' }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill="url(#gradRej)" radius={[0, 8, 8, 0]} maxBarSize={22}>
                <LabelList dataKey="count" position="right" fontSize={12} fill="#475569" />
              </Bar>
            </BarChart>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

const HEADER_ACCENT: Record<string, string> = {
  brand: 'from-brand-500 to-brand-700',
  saffron: 'from-accent-500 to-accent-600',
  emerald: 'from-emerald-400 to-emerald-600',
  rose: 'from-rose-400 to-rose-600',
};

function ChartCard({
  title,
  accent = 'brand',
  children,
}: {
  title: string;
  accent?: keyof typeof HEADER_ACCENT;
  children: React.ReactElement;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
        <span className={cn('h-5 w-1.5 rounded-full bg-gradient-to-b', HEADER_ACCENT[accent])} aria-hidden />
        <h2 className="text-base font-semibold text-content">{title}</h2>
      </div>
      <div className="p-3 sm:p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function DonutCenter({
  viewBox,
  total,
  caption,
}: {
  viewBox?: { cx?: number; cy?: number };
  total: number;
  caption: string;
}) {
  const cx = viewBox?.cx ?? 0;
  const cy = viewBox?.cy ?? 0;
  return (
    <g>
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-content" fontSize={28} fontWeight={800}>
        {formatNumber(total)}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" className="fill-content-muted" fontSize={11}>
        {caption}
      </text>
    </g>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  const p = entry.payload as { companyName?: string; status?: string } | undefined;
  const name = p?.companyName ?? p?.status ?? (label != null ? String(label) : undefined);
  return (
    <div className="rounded-xl border border-border/70 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      {name && <p className="mb-0.5 text-xs font-medium capitalize text-content-muted">{name}</p>}
      <p className="text-sm font-bold text-content">{formatNumber(Number(entry.value))}</p>
    </div>
  );
}
