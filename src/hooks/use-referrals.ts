import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useMyReferralCode() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-referral-code", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("referral_code").eq("id", user.id).single();
      return (data as any)?.referral_code as string | null;
    },
    enabled: !!user,
  });
}

export function useMyReferrals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-referrals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("referrals" as any).select("*").eq("referrer_id", user.id).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!user,
  });
}
