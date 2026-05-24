import { footerCopy } from "@/lib/brand";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <p className="font-display text-lg font-extrabold text-foreground">{footerCopy.title}</p>
        <p className="mt-3 text-sm text-muted-text">{footerCopy.copyright}</p>
        <p className="mt-2 text-sm font-medium text-foreground">{footerCopy.developer}</p>
        <p className="mt-3 text-sm italic text-muted-text">&ldquo;{footerCopy.motto}&rdquo;</p>
      </div>
    </footer>
  );
}
