import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, profiles, wallets, withdrawals, ledger] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total, status", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("wallets").select("balance"),
        supabase.from("withdrawals").select("id, status"),
        supabase.from("ledger_entries").select("amount, type, status").eq("type", "fee" as any).eq("status", "completed" as any),
      ]);

      const revenue = orders.data?.reduce((s, o) => s + (o.total || 0), 0) ?? 0;
      const platformFloat = wallets.data?.reduce((s: number, w: any) => s + (w.balance || 0), 0) ?? 0;
      const pendingWithdrawals = withdrawals.data?.filter((w: any) => w.status === "pending").length ?? 0;
      const platformFees = ledger.data?.reduce((s: number, e: any) => s + (e.amount || 0), 0) ?? 0;

      return {
        productCount: products.count ?? 0,
        orderCount: orders.count ?? 0,
        customerCount: profiles.count ?? 0,
        revenue,
        recentOrders: orders.data?.slice(0, 5) ?? [],
        platformFloat,
        pendingWithdrawals,
        platformFees,
      };
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
