import { useAuth } from "@/hooks/use-auth";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm font-display uppercase tracking-wider">Verifying ACP access…</p>
        </div>
      </div>
    );
  }

  const next = encodeURIComponent(location.pathname + location.search);

  if (!user) return <Navigate to={`/admin/login?next=${next}`} replace />;
  if (!isAdmin) return <Navigate to={`/admin/login?next=${next}`} replace />;

  return <>{children}</>;
}
