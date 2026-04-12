import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 ease-out',
        'hover:border-foreground/30 hover:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus:shadow-sm',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
export default Input;
