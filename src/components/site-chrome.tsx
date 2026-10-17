import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/how-it-works", label: "How it works", hi: "कैसे काम करता है" },
  { to: "/book", label: "Book transport", hi: "बुकिंग" },
  { to: "/dashboard", label: "Farmer", hi: "किसान" },
  { to: "/driver", label: "Driver", hi: "चालक" },
  { to: "/operator", label: "Operations", hi: "संचालन" },
  { to: "/pricing", label: "Pricing", hi: "मूल्य" },
  { to: "/help", label: "Help", hi: "सहायता" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="15" className="fill-forest" />
        <path d="M9 21c3-6 7-9 14-10-2 6-6 10-14 10Z" className="fill-harvest" />
        <path d="M9 21c4-3 7-5 11-8" className="stroke-ivory" strokeWidth="1.2" fill="none" />
      </svg>
      <span className="font-display text-xl font-semibold text-forest">KhetSetu</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-forest"
              activeProps={{ className: "text-forest underline decoration-harvest decoration-2 underline-offset-8" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/book" className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground lg:inline-block">
          Schedule pickup
        </Link>
        <button className="p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t bg-background px-5 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex justify-between border-b py-3 text-base last:border-0">
              <span>{n.label}</span><span className="text-muted-foreground">{n.hi}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="grain border-t bg-forest text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Many harvests. One journey.</p>
          <p className="mt-3 text-sm text-ivory/70">Pooled crop transport for small and marginal farmers, run with local Chhota Hathi and Bolero Pickup owners.</p>
        </div>
        <div className="text-sm text-ivory/80">
          <p className="eyebrow text-harvest">Product</p>
          <ul className="mt-3 space-y-2">
            <li><Link to="/how-it-works">How it works</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/help">Help & FAQ</Link></li>
          </ul>
        </div>
        <div className="text-sm text-ivory/70">
          <p className="eyebrow text-harvest">Prototype note</p>
          <p className="mt-3">Demo data only. Routing, maps and ONDC run through mock adapters until live services are connected.</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="grain border-b bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <p className="eyebrow text-earth">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold text-forest md:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}
