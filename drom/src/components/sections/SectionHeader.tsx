interface SectionHeaderProps {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeader({ index, eyebrow, title, intro, align = 'left' }: SectionHeaderProps) {
  return (
    <header className={align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'}>
      <div className={`flex items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="micro text-text-muted">{index}</span>
        <span className="h-px w-10 bg-signal-blue/60" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="mt-5 font-display text-h3 md:text-h2 font-light leading-[1.05] text-text-primary">
        {title}
      </h2>
      {intro && <p className="mt-5 text-lead text-text-secondary max-w-prose">{intro}</p>}
    </header>
  );
}
