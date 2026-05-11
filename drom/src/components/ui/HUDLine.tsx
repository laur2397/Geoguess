import { cn } from '@/lib/cn';

export function HUDLine({
  className,
  orientation = 'horizontal',
}: {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'block bg-gradient-to-r from-transparent via-signal-blue/40 to-transparent',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full bg-gradient-to-b',
        className,
      )}
    />
  );
}

export function HUDDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-6">
      <HUDLine className="flex-1" />
      {label && <span className="label">{label}</span>}
      <HUDLine className="flex-1" />
    </div>
  );
}
