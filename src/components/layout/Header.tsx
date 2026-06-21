import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { performLogout } from '@/hooks/useSession';
import { paths } from '@/routes/paths';
import { env } from '@/config/env';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { toast } from '@/components/ui/toast';

interface NavItem {
  to: string;
  label: string;
}

export function Header() {
  const { t } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const navItems = getNavItems(user?.role, t);

  async function handleLogout() {
    try {
      await performLogout();
      navigate(paths.home);
    } catch {
      toast.error(t('states.errorTitle'));
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      {/* Utility bar: accessibility toolbar + language + helpline. */}
      <div className="border-b border-border bg-surface-muted">
        <div className="mx-auto flex h-9 max-w-6xl flex-wrap items-center justify-between gap-2 px-4">
          <AccessibilityToolbar />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-content-muted sm:inline">
              {t('footer.helpline')}: <a href={`tel:${env.helplineNumber}`}>{env.helplineNumber}</a>
            </span>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Main bar: logo + centered nav + actions. */}
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          to={paths.home}
          className="flex shrink-0 items-center gap-2.5 no-underline focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-bold text-white shadow-sm"
          >
            र
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-content sm:text-lg">
              {t('app.name')}
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-content-muted sm:block">
              {t('app.subBrand')}
            </span>
          </span>
        </Link>

        {/* Desktop nav (centered) */}
        <nav
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
          aria-label={t('nav.menu')}
        >
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass} end>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
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
  );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'inline-flex h-9 items-center rounded-full px-4 text-sm font-medium no-underline transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600',
    isActive
      ? 'bg-brand-50 text-brand-800'
      : 'text-content-muted hover:bg-surface-muted hover:text-content',
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
        { to: paths.candidate.profile, label: t('nav.myProfile') },
      ];
    case 'employer':
      return [
        { to: paths.home, label: t('nav.home') },
        { to: paths.employer.jobs, label: t('nav.myJobs') },
        { to: paths.employer.profile, label: t('nav.myProfile') },
      ];
    case 'admin':
      return [
        { to: paths.admin.dashboard, label: t('nav.dashboard') },
        { to: paths.admin.employers, label: t('nav.employers') },
        { to: paths.admin.candidates, label: t('nav.candidates') },
        { to: paths.admin.users, label: t('nav.users') },
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
  const itemClass =
    'block w-full rounded px-3 py-2 text-left text-sm no-underline hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600';
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
          {navItems.map((item) => (
            <DropdownMenu.Item key={item.to} asChild>
              <NavLink to={item.to} className={itemClass} end>
                {item.label}
              </NavLink>
            </DropdownMenu.Item>
          ))}
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
