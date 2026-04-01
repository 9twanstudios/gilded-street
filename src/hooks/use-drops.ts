import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Drop {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string | null;
  drop_date: string;
  product_ids: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useDrops() {
  return useQuery({
    queryKey: ["drops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drops")
        .select("*")
        .order("drop_date", { ascending: false });
      if (error) throw error;
      return data as Drop[];
    },
  });
}

export function useDropBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["drops", "slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("drops")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Drop | null;
    },
    enabled: !!slug,
  });
}

export function useCreateDrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (drop: Omit<Drop, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("drops").insert(drop);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drops"] }),
  });
}

export function useUpdateDrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Drop> & { id: string }) => {
      const { error } = await supabase.from("drops").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drops"] }),
  });
}

export function useDeleteDrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drops").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drops"] }),
  });
}
