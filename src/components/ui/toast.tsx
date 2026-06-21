import { create } from 'zustand';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: ++counter }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative helpers usable anywhere (e.g. mutation callbacks). */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ tone: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ tone: 'error', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ tone: 'info', title, description }),
};

const toneStyles: Record<ToastTone, string> = {
  success: 'border-l-success',
  error: 'border-l-danger',
  info: 'border-l-info',
};

const toneIcon: Record<ToastTone, string> = {
  success: '✓',
  error: '!',
  info: 'i',
};

/** Mount once near the app root. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {toasts.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          onOpenChange={(open) => !open && dismiss(item.id)}
          className={cn(
            'flex items-start gap-3 rounded-lg border border-l-4 border-border bg-surface p-4 shadow-lg',
            toneStyles[item.tone],
          )}
        >
          <span aria-hidden="true" className="mt-0.5 font-bold">
            {toneIcon[item.tone]}
          </span>
          <div className="flex-1">
            <ToastPrimitive.Title className="font-semibold text-content">
              {item.title}
            </ToastPrimitive.Title>
            {item.description && (
              <ToastPrimitive.Description className="text-sm text-content-muted">
                {item.description}
              </ToastPrimitive.Description>
            )}
          </div>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </ToastPrimitive.Provider>
  );
}
