/**
 * Anchor wrapper that exposes both #inspection (mid-cinematic) and contains the
 * pinned cinematic stage. Splits the main hero/cinematic into a single tall section
 * so scrolljacking is contained and predictable.
 */
export function InspectionAnchor({ children }: { children: React.ReactNode }) {
  return (
    <div id="inspection" className="relative">
      {children}
    </div>
  );
}
