import { cn } from '../../lib/utils';

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div className="absolute h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}
