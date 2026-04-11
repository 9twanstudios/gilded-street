import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useWallet() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useLedger(userId?: string) {
  return useQuery({
    queryKey: ["ledger", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        amount,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
}

export function useMyWithdrawals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["withdrawals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Admin hooks
export function useAllWallets() {
  return useQuery({
    queryKey: ["admin-wallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*, profiles(full_name, email)")
        .order("balance", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllLedger(filters?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["admin-ledger", filters],
    queryFn: async () => {
      let query = supabase
        .from("ledger_entries")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filters?.type) query = query.eq("type", filters.type as any);
      if (filters?.status) query = query.eq("status", filters.status as any);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAllWithdrawals() {
  return useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function formatKES(amount: number) {
  return `KES ${(amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}
