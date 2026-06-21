import { createContext, useContext, useId } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/cn';

interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  hasError: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useField(): FieldContextValue {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error('useField must be used within <Field>');
  return ctx;
}

interface FieldProps {
  label: string;
  /** Help text wired via aria-describedby (WCAG 1.3.1 / 3.3.x). */
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Accessible form field: associates <label>, help text and error message with
 * the control via id + aria-describedby (HLD §10 forms requirement).
 */
export function Field({ label, help, error, required, className, children }: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, hasError: Boolean(error) }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <LabelPrimitive.Root htmlFor={id} className="font-medium text-content">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </LabelPrimitive.Root>
        {children}
        {help && (
          <p id={helpId} className="text-sm text-content-muted">
            {help}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
