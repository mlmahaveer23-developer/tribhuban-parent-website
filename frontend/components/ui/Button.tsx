import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

/* ─────────────────────────────────────────────────────────────────────────────
   Button variants — copper accent primary, ivory secondary, ghost, destructive.
   Uses CSS variables for theme-aware colours.
   Enhanced with micro-interaction: spring scale on tap/hover.
───────────────────────────────────────────────────────────────────────────── */
const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 overflow-hidden',
    'font-sans font-semibold whitespace-nowrap',
    'rounded-md border border-transparent',
    'transition-colors duration-150',
    'cursor-pointer select-none',
    'focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]',
          'hover:bg-[var(--btn-primary-hover)]',
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
          'bg-[#A83232] text-white',
          'hover:bg-[#8f2a2a]',
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
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild) {
      const Comp = Slot;
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as React.ComponentPropsWithRef<typeof motion.button>)}
      >
        <span className="relative z-10">{children}</span>
        {/* shimmer on hover for primary variant */}
        {(variant === 'primary' || variant === undefined) && (
          <motion.span
            className="absolute inset-0 bg-white/10 -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
