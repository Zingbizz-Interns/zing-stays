import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accentTop?: boolean;
  hoverEffect?: boolean;
  elevated?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, accentTop, hoverEffect, elevated, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-card border border-border rounded-lg transition-all duration-300 ease-out',
        accentTop && 'border-t-2 border-t-accent',
        elevated ? 'shadow-md' : 'shadow-sm',
        hoverEffect && 'hover:shadow-hover hover:border-border/80 hover:-translate-y-1 hover:bg-muted/30 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';
export default Card;
