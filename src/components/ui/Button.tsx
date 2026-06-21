import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-brand-700 text-white hover:bg-brand-800',
        secondary: 'bg-surface text-brand-700 border border-brand-700 hover:bg-brand-50',
        ghost: 'bg-transparent text-content hover:bg-surface-muted',
        danger: 'bg-danger text-white hover:opacity-90',
        link: 'bg-transparent text-brand-700 underline-offset-2 hover:underline p-0',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5',
        lg: 'px-6 py-3 text-lg',
        icon: 'h-10 w-10',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild, loading, children, disabled, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, block }), className);

    // Radix Slot requires exactly one child, so the spinner is only injected
    // for real <button> elements (asChild delegates rendering to the child).
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
