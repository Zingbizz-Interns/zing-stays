'use client';

interface ChipProps {
  label: string;
  active?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

export function Chip({ label, active = false, onRemove, onClick, disabled = false }: ChipProps) {
  const isRemovable = typeof onRemove === 'function';

  const baseClasses =
    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-95';

  const activeClasses = active
    ? 'bg-accent text-accent-foreground border-accent shadow-sm'
    : 'bg-muted text-muted-foreground border-transparent hover:border-border hover:bg-muted/80 hover:shadow-sm';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  if (isRemovable) {
    return (
      <span className={`${baseClasses} bg-accent/10 text-accent border-accent/20 ${disabledClasses}`}>
        {label}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${label}`}
          className="ml-1 rounded-full p-0.5 hover:bg-accent/20 transition-colors focus:outline-none focus-visible:ring-1"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
    >
      {label}
    </button>
  );
}

export default Chip;
