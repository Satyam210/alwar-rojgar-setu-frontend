import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-surface-muted text-content',
        info: 'border-info/30 bg-brand-50 text-info',
        success: 'border-success/30 bg-green-50 text-success',
        warning: 'border-warning/30 bg-amber-50 text-warning',
        danger: 'border-danger/30 bg-red-50 text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Icon/symbol rendered alongside the text so status is never colour-only. */
  icon?: React.ReactNode;
}

export function Badge({ className, tone, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {icon && (
        <span aria-hidden="true" className="text-xs">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
