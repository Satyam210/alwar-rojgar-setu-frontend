import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm button in the danger style for destructive actions. */
  destructive?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
  request: (options: ConfirmOptions) => Promise<boolean>;
  settle: (result: boolean) => void;
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  request: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve });
    }),
  settle: (result) => {
    get().resolve?.(result);
    set({ open: false, resolve: null });
  },
}));

/**
 * Imperative confirmation dialog — an accessible, on-brand replacement for the
 * native `window.confirm()`. Returns a promise that resolves to the user's
 * choice. Requires <ConfirmDialogHost /> to be mounted once (see App).
 *
 * Usage: `if (await confirmDialog({ title, body })) { ... }`
 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().request(options);
}

/** Single mounted host that renders whichever confirm request is active. */
export function ConfirmDialogHost() {
  const { t } = useTranslation('common');
  const open = useConfirmStore((s) => s.open);
  const options = useConfirmStore((s) => s.options);
  const settle = useConfirmStore((s) => s.settle);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) settle(false);
      }}
      title={options?.title ?? ''}
      description={options?.body}
      footer={
        <>
          <Button variant="secondary" onClick={() => settle(false)}>
            {options?.cancelLabel ?? t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant={options?.destructive ? 'danger' : 'primary'}
            onClick={() => settle(true)}
          >
            {options?.confirmLabel ?? t('actions.confirm', { defaultValue: 'Confirm' })}
          </Button>
        </>
      }
    />
  );
}
