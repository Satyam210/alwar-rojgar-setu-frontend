import { forwardRef, useState } from 'react';
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

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

/**
 * Password input with show/hide toggle.
 * Drop-in replacement for <Input type="password" /> — must be inside <Field>.
 */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const { id, describedBy, hasError } = useField();

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={visible ? 'text' : 'password'}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        className={cn(
          baseInput,
          'pr-10',
          hasError ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-content-muted hover:text-content focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600 rounded-r"
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
