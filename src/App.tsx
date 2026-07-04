import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes/router';
import { useSessionBootstrap } from '@/hooks/useSession';
import { useA11yStore } from '@/stores/a11yStore';
import { Toaster } from '@/components/ui/toast';
import { env } from '@/config/env';
import { MockBadge } from '@/components/dev/MockBadge';
import { LanguageGate } from '@/components/layout/LanguageGate';
import { ConfirmDialogHost } from '@/components/ui/ConfirmDialog';
import { bootstrapPageTranslation } from '@/lib/appLanguage';

export function App() {
  const initA11y = useA11yStore((s) => s.init);

  // Apply persisted accessibility preferences before content settles.
  useEffect(() => {
    initA11y();
  }, [initA11y]);

  // Rehydrate the session (GET /users/current via silent refresh if needed).
  useSessionBootstrap();

  // If the app loads already in a non-source language, re-apply the backend
  // page-translation so dynamic content stays translated after a refresh.
  useEffect(() => {
    bootstrapPageTranslation();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <LanguageGate />
      <Toaster />
      <ConfirmDialogHost />
      {env.useMocks && <MockBadge />}
    </QueryClientProvider>
  );
}
