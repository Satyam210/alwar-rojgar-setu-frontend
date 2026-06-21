import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { useField } from './Field';

const baseInput =
  'w-full rounded border bg-surface px-3 py-2.5 text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600 disabled:opacity-60';

/** Text input — must be rendered inside <Field> for label/error wiring. */
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const { id, describedBy, hasError } = useField();
    return (
      <input
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        className={cn(baseInput, hasError ? 'border-danger' : 'border-border', className)}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  const { id, describedBy, hasError } = useField();
  return (
    <textarea
      ref={ref}
      id={id}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      className={cn(baseInput, 'min-h-28', hasError ? 'border-danger' : 'border-border', className)}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

/** Native select for simple cases (filters, enums). */
export const NativeSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  const { id, describedBy, hasError } = useField();
  return (
    <select
      ref={ref}
      id={id}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      className={cn(baseInput, hasError ? 'border-danger' : 'border-border', className)}
      {...props}
    >
      {children}
    </select>
  );
});
NativeSelect.displayName = 'NativeSelect';
