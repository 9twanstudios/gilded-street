import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Home, Plus, Shirt, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { StudioActionSheet } from "@/components/store/StudioActionSheet";

type Tab = "home" | "fitcheck" | "saved" | "profile";

function NavLink({ icon: Icon, label, to, active, badge }: { icon: LucideIcon; label: string; to: string; active: boolean; badge?: number }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`relative flex flex-1 flex-col items-center gap-0.5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-3 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <span className="text-[10px] font-display font-semibold uppercase tracking-wider">{label}</span>
    </Link>
  );
}

/** Sanaa1-style 5-action tab bar: Home · FitCheck · Studio(+) · Saved · My Fitz. */
export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { data: wishlist } = useWishlist();
  const [studioOpen, setStudioOpen] = useState(false);

  const onAccount = location.pathname === "/account";
  const onSaved = onAccount && location.search.includes("tab=wishlist");
  const onFitcheck = location.pathname.startsWith("/fitcheck") || location.pathname.startsWith("/fits");
  const savedCount = wishlist?.length ?? 0;
  const savedTo = user ? "/account?tab=wishlist" : "/auth/sign-in?next=/account?tab=wishlist";
  const profileTo = user ? "/account" : "/auth/sign-in?next=/account";

  return (
    <>
      <nav aria-label="Primary mobile" className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur safe-area-bottom">
        <div className="flex h-16 items-stretch px-2">
          <NavLink icon={Home} label="Home" to="/" active={location.pathname === "/"} />
          <NavLink icon={Shirt} label="FitCheck" to="/fitcheck" active={onFitcheck} />
          <button
            type="button"
            aria-label="Open Studio"
            aria-expanded={studioOpen}
            onClick={() => setStudioOpen(true)}
            className="flex flex-1 flex-col items-center justify-center"
          >
            <span className="-mt-6 flex h-13 w-13 items-center justify-center rounded-full border border-primary bg-background shadow-[0_0_16px_rgba(255,215,0,0.35)]">
              <Plus className="h-6 w-6 text-primary" aria-hidden />
            </span>
            <span className="mt-0.5 text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground">Studio</span>
          </button>
          <NavLink icon={Heart} label="Saved" to={savedTo} active={onSaved} badge={savedCount} />
          <NavLink icon={User} label="My Fitz" to={profileTo} active={onAccount && !onSaved} />
        </div>
      </nav>
      <StudioActionSheet open={studioOpen} onOpenChange={setStudioOpen} />
    </>
  );
}
