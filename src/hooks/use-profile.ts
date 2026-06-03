import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  referral_code: string | null;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  location_city: string | null;
  cover_url: string | null;
  social: Record<string, string> | null;
  interests: string[] | null;
  style_tags: string[] | null;
  pronouns: string | null;
  birthday: string | null;
  onboarding_step: string | null;
  onboarding_completed_at: string | null;
  suspended_at: string | null;
  created_at: string;
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as unknown as Profile | null;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("profiles").update(patch as any).eq("id", user.id).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });
}

export function useCompleteOnboarding() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update({ onboarding_completed_at: new Date().toISOString() } as any).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
