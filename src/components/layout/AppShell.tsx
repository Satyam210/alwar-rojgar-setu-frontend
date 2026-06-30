import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Shared app shell (HLD §4): skip link → header (logo, language toggle,
 * accessibility toolbar, role-aware nav) → main landmark → GIGW footer.
 * Wraps every route so semantic landmarks are consistent (WCAG 1.3.1).
 */
export function AppShell() {
  const { t } = useTranslation('common');
  return (
    <div className="flex min-h-screen flex-col">
      {/* Subtle Alwar heritage wallpaper (Bala Qila & City Palace) behind the whole page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-fixed opacity-[0.45]"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}alwar-heritage.png')` }}
      />
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
