import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmailPassword } from '@/api/auth';
import { getCurrentUser } from '@/api/users';
import { useAuthStore, isProfileComplete } from '@/stores/authStore';
import { postLoginPath } from '@/routes/paths';
import type { Role } from '@/api/types';
import { DEMO_EMAILS } from '@/mocks/seed';
import { Button } from '@/components/ui/Button';

const ACCOUNTS: { id: string; role: Role; email: string; password: string; label: string }[] = [
  { id: 'candidate', role: 'candidate', email: DEMO_EMAILS.candidate, password: 'Candidate@123', label: 'Job Seeker' },
  { id: 'newCandidate', role: 'candidate', email: DEMO_EMAILS.newCandidate, password: 'Password@123', label: 'New Job Seeker (empty profile)' },
  { id: 'employer', role: 'employer', email: DEMO_EMAILS.employer, password: 'Employer@123', label: 'Employer (Owner)' },
  { id: 'newEmployer', role: 'employer', email: DEMO_EMAILS.newEmployer, password: 'Password@123', label: 'New Employer (empty profile)' },
  { id: 'admin', role: 'admin', email: DEMO_EMAILS.admin, password: 'Admin@123', label: 'Admin' },
];

export function DemoLoginPanel() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [busy, setBusy] = useState<string | null>(null);

  async function loginAs(account: (typeof ACCOUNTS)[number]) {
    setBusy(account.id);
    try {
      const { email, password } = account;
      await loginWithEmailPassword({ email, password });
      const user = await getCurrentUser();
      setUser(user);
      navigate(postLoginPath(user.role, isProfileComplete(user)), { replace: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-dashed border-brand-400 bg-brand-50 p-4">
      <p className="mb-1 text-sm font-semibold text-brand-800">Demo mode — quick login</p>
      <p className="mb-3 text-xs text-content-muted">
        Pick a role to jump into a seeded account.
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
