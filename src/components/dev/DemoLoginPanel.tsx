import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '@/api/auth';
import { getCurrentUser } from '@/api/users';
import { useAuthStore } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import type { Role } from '@/api/types';
import { DEMO_PHONES } from '@/mocks/seed';
import { Button } from '@/components/ui/Button';

/**
 * Mock-only shortcut: one-click sign-in as a seeded demo account. Reuses the
 * real OTP login functions (routed through the mock adapter), so it exercises
 * the same code path as the live login. Admin lives here because it isn't in
 * the public role picker.
 */
const ACCOUNTS: { id: string; role: Role; phone: string; label: string }[] = [
  { id: 'candidate', role: 'candidate', phone: DEMO_PHONES.candidate, label: 'Job Seeker' },
  { id: 'employer', role: 'employer', phone: DEMO_PHONES.employer, label: 'Employer (Owner)' },
  { id: 'hrHead', role: 'employer', phone: DEMO_PHONES.hrHead, label: 'HR Head' },
  { id: 'admin', role: 'admin', phone: DEMO_PHONES.admin, label: 'Admin' },
];

export function DemoLoginPanel() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [busy, setBusy] = useState<string | null>(null);

  async function loginAs(account: (typeof ACCOUNTS)[number]) {
    setBusy(account.id);
    try {
      const { phone, role } = account;
      await requestOtp({ phone, role });
      await verifyOtp({ phone, otp: '123456' });
      const user = await getCurrentUser();
      setUser(user);
      navigate(postLoginPath(user.role, user.profileCompleted), { replace: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-dashed border-brand-400 bg-brand-50 p-4">
      <p className="mb-1 text-sm font-semibold text-brand-800">Demo mode — quick login</p>
      <p className="mb-3 text-xs text-content-muted">
        No real OTP. Pick a role to jump into a seeded account.
      </p>
      <div className="flex flex-wrap gap-2">
        {ACCOUNTS.map((a) => (
          <Button
            key={a.id}
            size="sm"
            variant="secondary"
            loading={busy === a.id}
            disabled={busy !== null}
            onClick={() => loginAs(a)}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
