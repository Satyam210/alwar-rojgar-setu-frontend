import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { performLogout } from '@/hooks/useSession';
import { paths } from '@/routes/paths';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { PageTranslateWidget } from './PageTranslateWidget';
import { toast } from '@/components/ui/toast';

interface NavItem {
  to: string;
  label: string;
  /** Extra routes that should also mark this tab active (e.g. onboarding = My Profile). */
  matchPaths?: string[];
}

/** True when the current path matches the item's own route or any of its matchPaths. */
function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.to) return true;
  return (item.matchPaths ?? []).some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function Header() {
  const { t } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = getNavItems(user?.role, t);

  async function handleLogout() {
    try {
      await performLogout();
      navigate(paths.home);
    } catch {
      toast.error(t('states.errorTitle'));
    }
  }

  const base = import.meta.env.BASE_URL;

  return (
    <>
      {/* Top utility strip: accessibility + helpline + language together (gov-portal style). */}
      <div className="relative z-10 border-b border-accent-100 bg-accent-50 [&_a:hover]:underline [&_a]:text-brand-700">
        <div className="flex w-full flex-wrap items-center justify-end gap-3 px-4 py-1 sm:px-6">
          <AccessibilityToolbar />
          <LanguageToggle />
          <PageTranslateWidget />
        </div>
      </div>

      {/* Main bar: national emblem + brand, centered nav, actions. */}
      <header className="sticky top-0 z-30 border-b border-accent-100 bg-accent-50/90 backdrop-blur supports-[backdrop-filter]:bg-accent-50/75">
      <div className="mx-auto flex h-24 max-w-6xl items-center gap-3 px-4 sm:h-28 sm:gap-4">
        <Link
          to={paths.home}
          className="flex shrink-0 items-center gap-3 text-content no-underline hover:no-underline focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          <img
            src={`${base}govt-emblem.png`}
            alt={t('govt.emblemAlt')}
            className="h-20 w-auto sm:h-[5.5rem]"
            width={55}
            height={88}
            loading="eager"
          />
          <span className="hidden h-12 w-px bg-border sm:block" aria-hidden="true" />
          <span className="flex flex-col gap-1 leading-tight">
            <span className="text-2xl font-bold tracking-tight text-brand-800 sm:text-[32px]">
              {t('app.name')}
            </span>
            <span className="hidden text-[11px] font-medium text-content-muted sm:block">
              {t('govt.rajasthanGov')} · {t('app.subBrand')}
            </span>
          </span>
        </Link>

        {/* Desktop nav + primary action grouped as one right-aligned cluster. */}
        <div className="ml-auto hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-1" aria-label={t('nav.menu')}>
            {navItems.map((item) => {
              const active = isNavItemActive(item, pathname);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  aria-current={active ? 'page' : undefined}
                  className={navLinkClass(active)}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <span className="h-8 w-px bg-border" aria-hidden="true" />

          {user ? (
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              {t('nav.logout')}
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to={paths.login}>{t('nav.login')}</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <div className="ml-auto md:hidden">
          <MobileMenu
            navItems={navItems}
            isAuthed={Boolean(user)}
            onLogout={handleLogout}
            label={t('nav.menu')}
            loginLabel={t('nav.login')}
            logoutLabel={t('nav.logout')}
          />
        </div>
      </div>
    </header>
    </>
  );
}

function navLinkClass(isActive: boolean) {
  return cn(
    'inline-flex h-9 items-center rounded-full px-4 text-sm font-bold no-underline transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600',
    isActive
      ? 'bg-brand-700 text-white shadow-sm hover:bg-brand-800'
      : 'text-brand-800 hover:bg-brand-50 hover:text-brand-900',
  );
}

function getNavItems(role: string | undefined, t: (k: string) => string): NavItem[] {
  const common: NavItem[] = [
    { to: paths.home, label: t('nav.home') },
    { to: paths.jobs, label: t('nav.findJobs') },
  ];
  switch (role) {
    case 'candidate':
      return [
        ...common,
        { to: paths.candidate.applications, label: t('nav.myApplications') },
        {
          to: paths.candidate.profile,
          label: t('nav.myProfile'),
          matchPaths: [paths.candidate.onboarding],
        },
      ];
    case 'employer':
      return [
        { to: paths.home, label: t('nav.home') },
        { to: paths.employer.jobs, label: t('nav.myJobs') },
        {
          to: paths.employer.profile,
          label: t('nav.myProfile'),
          matchPaths: [paths.employer.onboarding],
        },
        { to: paths.settings, label: t('nav.settings') },
      ];
    case 'admin':
      return [
        { to: paths.admin.dashboard, label: t('nav.dashboard') },
        { to: paths.admin.employers, label: t('nav.employers') },
        { to: paths.admin.candidates, label: t('nav.candidates') },
        { to: paths.admin.users, label: t('nav.users') },
        { to: paths.admin.testimonials, label: t('nav.testimonials') },
        { to: paths.settings, label: t('nav.settings') },
      ];
    default:
      return common;
  }
}

function MobileMenu({
  navItems,
  isAuthed,
  onLogout,
  label,
  loginLabel,
  logoutLabel,
}: {
  navItems: NavItem[];
  isAuthed: boolean;
  onLogout: () => void;
  label: string;
  loginLabel: string;
  logoutLabel: string;
}) {
  const { pathname } = useLocation();
  const itemClass =
    'block w-full rounded px-3 py-2 text-left text-sm no-underline focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600';
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="icon" aria-label={label}>
          <span aria-hidden="true">☰</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-48 rounded-lg border border-border bg-surface p-1 shadow-lg"
        >
          {navItems.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <DropdownMenu.Item key={item.to} asChild>
                <NavLink
                  to={item.to}
                  end
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    itemClass,
                    active
                      ? 'bg-brand-700 font-semibold text-white'
                      : 'hover:bg-surface-muted',
                  )}
                >
                  {item.label}
                </NavLink>
              </DropdownMenu.Item>
            );
          })}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            {isAuthed ? (
              <button type="button" className={itemClass} onClick={onLogout}>
                {logoutLabel}
              </button>
            ) : (
              <NavLink to={paths.login} className={itemClass}>
                {loginLabel}
              </NavLink>
            )}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
