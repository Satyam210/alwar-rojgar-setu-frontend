import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Accessible modal built on Radix Dialog — focus trap, Esc to close, labelled
 * by title (WCAG 2.1.x keyboard, screen-reader correct by default).
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const { t } = useTranslation('common');
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 shadow-lg',
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-content">{title}</Dialog.Title>
            <Dialog.Close
              className="rounded p-1 text-content-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600"
              aria-label={t('actions.close')}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className="mb-4 text-content-muted">
              {description}
            </Dialog.Description>
          )}
          {children}
          {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
