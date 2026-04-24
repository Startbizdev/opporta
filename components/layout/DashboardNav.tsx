"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import {
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Rss,
  Search,
  X,
} from "lucide-react";
import { getClientAuthHeader } from "@/lib/auth-header";

function NavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative flex items-center gap-3 rounded-lg py-2 pl-2.5 pr-2 text-[13px] font-medium leading-none tracking-[-0.01em] transition-colors duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-shell ${
        active
          ? "bg-overlay text-foreground"
          : "text-text-secondary hover:bg-overlay-subtle hover:text-text-primary"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-colors duration-150 ${
          active ? "bg-primary" : "bg-transparent group-hover:bg-overlay-hover"
        }`}
        aria-hidden
      />
      <Icon
        className={`size-[18px] shrink-0 transition-opacity duration-150 ${
          active ? "text-primary opacity-100" : "opacity-70 group-hover:opacity-100"
        }`}
        strokeWidth={1.65}
      />
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({
  credits,
  username,
  onLogout,
  onNavigate,
}: {
  credits: number | null;
  username: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-3 pb-6 pt-5 md:pt-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-start gap-3 rounded-lg px-1 py-0.5 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-shell"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-notion bg-gradient-to-br from-foreground/10 to-foreground/[0.04] ring-1 ring-border">
            <LayoutGrid className="size-[18px] text-foreground" strokeWidth={1.65} />
          </span>
          <span className="min-w-0 pt-0.5">
            <span className="block text-[15px] font-semibold tracking-tight text-foreground">
              OPPORTA
            </span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
              Opportunités
            </span>
          </span>
        </Link>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 pb-4"
        aria-label="Navigation principale"
      >
        <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary/90">
          Menu
        </p>
        <NavLink href="/" label="Fil" icon={Rss} onNavigate={onNavigate} />
        <NavLink
          href="/search"
          label="Recherche"
          icon={Search}
          onNavigate={onNavigate}
        />
        <NavLink
          href="/messages"
          label="Messages"
          icon={MessageCircle}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="shrink-0 border-t border-border px-2.5 pb-5 pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-medium text-text-tertiary">
            Crédits
          </span>
          <span className="tabular-nums text-[13px] font-semibold tracking-tight text-foreground">
            {credits === null ? "—" : credits}
          </span>
        </div>

        {username ? (
          <div className="mt-4 flex min-w-0 items-center gap-2.5">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-field text-[10px] font-semibold uppercase tracking-[0.02em] text-text-secondary ring-1 ring-border"
              aria-hidden
            >
              {username.slice(0, 2)}
            </span>
            <p className="min-w-0 flex-1 truncate text-[12px] font-medium leading-tight text-foreground">
              {username}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center gap-2 rounded-md py-1.5 text-left text-[12px] font-medium text-text-tertiary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
        >
          <LogOut className="size-3.5 shrink-0 opacity-60" strokeWidth={1.65} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const name = localStorage.getItem("username") || "";
    queueMicrotask(() => setUsername(name));

    if (!user) {
      router.push("/login");
      return;
    }

    const uid = localStorage.getItem("userId");
    if (!uid) {
      void fetch("/api/auth/ensure-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((p: { id?: string; username?: string } | null) => {
          if (p?.id) localStorage.setItem("userId", p.id);
          if (p?.username) localStorage.setItem("username", p.username);
        })
        .catch(() => {});
    }

    const loadCredits = async () => {
      try {
        const res = await fetch("/api/credits", {
          headers: getClientAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          setCredits(typeof data.amount === "number" ? data.amount : 3);
        } else {
          setCredits(3);
        }
      } catch {
        setCredits(3);
      }
    };

    void loadCredits();
  }, [router]);

  useEffect(() => {
    startTransition(() => setMobileOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Barre mobile — fine, tactile */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-shell/95 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-shell/90 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex size-9 items-center justify-center rounded-notion text-text-secondary transition-colors hover:bg-overlay-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-sidebar"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-[22px]" strokeWidth={1.65} />
        </button>
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-notion bg-overlay text-foreground">
            <LayoutGrid className="size-4" strokeWidth={1.65} />
          </span>
          <span className="truncate text-[14px]">OPPORTA</span>
        </Link>
        <div className="flex shrink-0 items-baseline gap-1.5 tabular-nums text-[11px] text-text-tertiary">
          <span className="font-medium text-text-tertiary">Créd.</span>
          <span className="font-semibold text-foreground">
            {credits === null ? "—" : credits}
          </span>
        </div>
      </header>

      {/* Overlay mobile */}
      <div
        role="presentation"
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
      />

      {/* Sidebar : tiroir sur mobile, rail fixe md+ (w-56 = 14rem) */}
      <aside
        id="dashboard-sidebar"
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(17.5rem,88vw)] max-w-[280px] flex-col border-r border-border bg-shell shadow-[4px_0_24px_-8px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:z-30 md:w-56 md:max-w-none md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Accent vertical subtil façon produit SaaS */}
        <div
          className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-border to-transparent opacity-90"
          aria-hidden
        />

        <div className="flex h-14 shrink-0 items-center justify-end border-b border-border/80 px-2 md:hidden">
          <button
            type="button"
            onClick={closeMobile}
            className="flex size-9 items-center justify-center rounded-notion text-text-secondary hover:bg-overlay-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
            aria-label="Fermer le menu"
          >
            <X className="size-[20px]" strokeWidth={1.65} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:pt-0">
          <SidebarContent
            credits={credits}
            username={username}
            onLogout={handleLogout}
            onNavigate={closeMobile}
          />
        </div>
      </aside>
    </>
  );
}
