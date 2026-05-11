import { cn } from '@/lib/cn';

interface TechnicalCardProps {
  index?: string;
  label: string;
  title: string;
  body: string;
  icon?: React.ReactNode;
  className?: string;
}

export function TechnicalCard({ index, label, title, body, icon, className }: TechnicalCardProps) {
  return (
    <article
      className={cn(
        'group panel hud-corner relative p-6 lg:p-7 transition-colors duration-300',
        'hover:border-signal-blue/60',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="micro text-text-muted">{index ?? label}</span>
        {icon && <span className="text-signal-blue/80">{icon}</span>}
      </div>
      <h3 className="font-display text-h5 text-text-primary leading-tight">{title}</h3>
      <p className="mt-3 text-body text-text-secondary">{body}</p>
      <span
        aria-hidden
        className="absolute left-6 right-6 bottom-0 h-px bg-gradient-to-r from-transparent via-signal-blue/40 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </article>
  );
}
