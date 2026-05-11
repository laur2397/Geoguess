/**
 * Visible message for users without JavaScript. Provides direct access to
 * the underlying static content sections that follow the cinematic stage.
 */
export function NoScriptFallback() {
  return (
    <noscript>
      <div className="fixed top-16 left-0 right-0 z-50 bg-ink-900 border-y border-border-blue/30">
        <div className="shell py-3 flex items-center justify-between gap-4">
          <span className="micro text-text-secondary">
            INTERACTIVE CINEMATIC REQUIRES JAVASCRIPT — STATIC PRODUCT INFORMATION IS AVAILABLE BELOW.
          </span>
          <a href="#overview" className="micro text-signal-cyan underline underline-offset-4">
            VIEW OVERVIEW
          </a>
        </div>
      </div>
    </noscript>
  );
}
