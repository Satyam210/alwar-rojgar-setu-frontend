import { resetDb } from '@/mocks/db';

/** Small fixed badge shown only in mock mode — wipes demo data back to seed. */
export function MockBadge() {
  function reset() {
    if (window.confirm('Reset all demo data back to the original seed?')) {
      resetDb();
      window.location.href = '/';
    }
  }

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full border border-border bg-surface/95 px-3 py-1.5 text-xs shadow-md backdrop-blur">
      <span className="inline-block h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
      <span className="font-medium text-content">Demo data</span>
      <button
        type="button"
        onClick={reset}
        className="font-semibold text-brand-700 hover:underline"
      >
        Reset
      </button>
    </div>
  );
}
