import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type IGEmbed = {
  id: string;
  scope: "home_featured" | "creator";
  creator_id: string | null;
  post_url: string;
  caption: string;
  order: number;
  active: boolean;
  created_at: string;
};

export function useIGEmbeds(scope: IGEmbed["scope"], creatorId?: string) {
  return useQuery({
    queryKey: ["ig_embeds", scope, creatorId ?? null],
    queryFn: async () => {
      let q: any = supabase.from("ig_embeds" as any).select("*").eq("scope", scope).eq("active", true).order("order", { ascending: true });
      if (creatorId) q = q.eq("creator_id", creatorId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as IGEmbed[];
    },
  });
}

export function useAdminIGEmbeds() {
  return useQuery({
    queryKey: ["ig_embeds", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ig_embeds" as any).select("*").order("scope").order("order");
      if (error) throw error;
      return (data ?? []) as unknown as IGEmbed[];
    },
  });
}

export function useUpsertIGEmbed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: Partial<IGEmbed> & { id?: string }) => {
      if (e.id) {
        const { error } = await supabase.from("ig_embeds" as any).update(e as any).eq("id", e.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ig_embeds" as any).insert(e as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["ig_embeds"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteIGEmbed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ig_embeds" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ig_embeds"] }),
  });
}
