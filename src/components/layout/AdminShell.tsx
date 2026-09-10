import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { performLogout } from '@/hooks/useSession';
import { paths } from '@/routes/paths';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { PageTranslateWidget } from './PageTranslateWidget';
import { Footer } from './Footer';
import { toast } from '@/components/ui/toast';

interface SideNavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="15" rx="1" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function AdminShell() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const base = import.meta.env.BASE_URL;

  const navItems: SideNavItem[] = [
    { to: paths.admin.dashboard, label: t('nav.dashboard'), icon: <GridIcon /> },
    { to: paths.admin.employers, label: t('nav.employers'), icon: <BuildingIcon /> },
    { to: paths.admin.candidates, label: t('nav.candidates'), icon: <UsersIcon /> },
    { to: paths.admin.users, label: t('nav.users'), icon: <ShieldIcon /> },
    { to: paths.admin.testimonials, label: t('nav.testimonials'), icon: <StarIcon /> },
    { to: paths.settings, label: t('nav.settings'), icon: <GearIcon /> },
  ];

  async function handleLogout() {
    try {
      await performLogout();
      navigate(paths.home);
    } catch {
      toast.error(t('states.errorTitle'));
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-fixed opacity-[0.45]"
        style={{ backgroundImage: `url('${base}alwar-heritage.png')` }}
      />

      <a href="#main-content" className="skip-link">
        {t('a11y.skipToContent')}
      </a>

      {/* Utility strip */}
      <div className="relative z-10 border-b border-accent-100 bg-accent-50 [&_a:hover]:underline [&_a]:text-brand-700">
        <div className="flex w-full flex-wrap items-center justify-end gap-3 px-4 py-1 sm:px-6">
          <AccessibilityToolbar />
          <LanguageToggle />
          <PageTranslateWidget />
        </div>
      </div>

      {/* Slim top bar */}
      <header className="sticky top-0 z-30 border-b border-accent-100 bg-accent-50/95 backdrop-blur supports-[backdrop-filter]:bg-accent-50/80">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="rounded-md p-1.5 text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 md:hidden"
            aria-label={t('nav.menu')}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          <Link
            to={paths.home}
            className="flex shrink-0 items-center gap-2.5 text-content no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <img
              src={`${base}govt-emblem.png`}
              alt={t('govt.emblemAlt')}
              className="h-9 w-auto"
              width={28}
              height={45}
              loading="eager"
            />
            <span className="text-lg font-bold tracking-tight text-brand-800">
              {t('app.name')}
            </span>
            <span className="hidden rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 sm:block">
              Admin
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {user?.email && (
              <span className="hidden text-xs text-content-muted sm:block">{user.email}</span>
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-accent-100 bg-accent-50/95 pt-16 transition-transform duration-200 ease-in-out md:sticky md:top-16 md:z-auto md:h-[calc(100vh-4rem)] md:translate-x-0 md:pt-0 md:transition-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {/* Mobile close */}
          <div className="flex items-center justify-between border-b border-accent-100 px-4 py-3 md:hidden">
            <span className="text-sm font-semibold text-content">{t('nav.menu')}</span>
            <button
              type="button"
              className="rounded-md p-1 text-content-muted hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex flex-col gap-1 overflow-y-auto p-3" aria-label={t('nav.menu')}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === paths.admin.dashboard}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
                    isActive
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'text-brand-800 hover:bg-brand-100 hover:text-brand-900',
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6"
        >
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
