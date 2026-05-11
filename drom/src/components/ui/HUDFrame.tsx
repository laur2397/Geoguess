import { cn } from '@/lib/cn';

interface HUDFrameProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  status?: string;
  as?: 'div' | 'section' | 'aside' | 'article';
}

export function HUDFrame({
  children,
  className,
  label,
  status,
  as: Tag = 'div',
}: HUDFrameProps) {
  return (
    <Tag className={cn('panel hud-corner relative p-5 sm:p-6', className)}>
      {(label || status) && (
        <div className="mb-4 flex items-center justify-between">
          {label && <span className="label">{label}</span>}
          {status && (
            <span className="micro flex items-center gap-2 text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
              {status}
            </span>
          )}
        </div>
      )}
      {children}
    </Tag>
  );
}
