import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  capabilities: string[];
  hasCapability: (cap: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isCreator: false,
  capabilities: [],
  hasCapability: () => false,
  signOut: async () => {},
});

function deriveCapabilities(roles: string[]): string[] {
  const caps = new Set<string>();
  if (roles.includes("admin")) {
    [
      "acp.access",
      "products.moderate",
      "products.delete",
      "orders.manage",
      "withdrawals.approve",
      "settings.update",
      "finance.view",
      "users.manage",
      "qr.manage",
      "seo.manage",
      "analytics.view",
    ].forEach((c) => caps.add(c));
  }
  if (roles.includes("creator")) {
    ["products.create_own", "products.update_own", "wallet.view_own"].forEach((c) => caps.add(c));
  }
  caps.add("orders.create_own");
  caps.add("wallet.view_own");
  return Array.from(caps);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [capabilities, setCapabilities] = useState<string[]>([]);

  const hydrateRoles = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = data?.map((r) => r.role as string) ?? [];
    setIsAdmin(roles.includes("admin"));
    setIsCreator(roles.includes("creator"));
    setCapabilities(deriveCapabilities(roles));
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Subscribe to future auth changes (synchronous handler)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Defer DB call to avoid deadlock inside auth callback
        setTimeout(() => {
          hydrateRoles(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsCreator(false);
        setCapabilities([]);
      }
    });

    // 2. Initial hydration: gate `loading` on BOTH session + role resolution
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await hydrateRoles(session.user.id);
      }
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateRoles]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const hasCapability = useCallback((cap: string) => capabilities.includes(cap), [capabilities]);

  const value = useMemo(
    () => ({ user, session, loading, isAdmin, isCreator, capabilities, hasCapability, signOut }),
    [user, session, loading, isAdmin, isCreator, capabilities, hasCapability, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
