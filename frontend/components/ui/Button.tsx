import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

/* ─────────────────────────────────────────────────────────────────────────────
   Button variants — copper accent primary, ivory secondary, ghost, destructive
   Uses CSS variables for theme-aware colours.
───────────────────────────────────────────────────────────────────────────── */
const buttonVariants = cva(
  // Base styles applied to every variant
  [
    'inline-flex items-center justify-center gap-2',
    'font-sans font-semibold whitespace-nowrap',
    'rounded-md border border-transparent',
    'transition-colors duration-150',
    'cursor-pointer select-none',
    // Accessibility: visible focus ring using brand gold
    'focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
    // Disabled state
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
          'hover:bg-[var(--btn-primary-hover)]',
          'active:bg-[var(--accent-hover)]',
        ],
        secondary: [
          'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)]',
          'border-[var(--border)]',
          'hover:bg-[var(--btn-secondary-hover)]',
        ],
        ghost: [
          'bg-transparent text-[var(--fg)]',
          'hover:bg-[var(--bg-muted)]',
        ],
        destructive: [
          'bg-danger text-ivory-50',
          'hover:bg-danger/90',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, the button renders as its child element (polymorphic slot).
   * Useful for rendering a `<Link>` with button styles.
   */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
