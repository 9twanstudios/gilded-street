import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export type FitItem = {
  product_id: string;
  slot: string;
  z: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  image: string;
  name: string;
  price: number;
};

export type Fit = {
  id: string;
  user_id: string;
  model: "male" | "female";
  name: string;
  items: FitItem[];
  cover_image: string | null;
  visibility: "private" | "public";
  likes_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export function useMyFits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fits", "mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fits" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Fit[];
    },
  });
}

export function usePublicFits(sort: "latest" | "popular" | "featured" = "latest") {
  return useQuery({
    queryKey: ["fits", "public", sort],
    queryFn: async () => {
      let q: any = supabase.from("fits" as any).select("*").eq("visibility", "public");
      if (sort === "featured") q = q.eq("featured", true).order("updated_at", { ascending: false });
      else if (sort === "popular") q = q.order("likes_count", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q.limit(60);
      if (error) throw error;
      return (data ?? []) as unknown as Fit[];
    },
  });
}

export function useFit(id: string | undefined) {
  return useQuery({
    queryKey: ["fits", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("fits" as any).select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as unknown as Fit | null;
    },
  });
}

export function useSaveFit() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Fit> & { id?: string }) => {
      if (!user) throw new Error("Sign in to save fits");
      const payload: any = {
        user_id: user.id,
        model: input.model ?? "male",
        name: input.name ?? "Untitled Fit",
        items: input.items ?? [],
        cover_image: input.cover_image ?? null,
        visibility: input.visibility ?? "private",
      };
      if (input.id) {
        const { data, error } = await supabase.from("fits" as any).update(payload).eq("id", input.id).select().maybeSingle();
        if (error) throw error;
        return data as unknown as Fit;
      }
      const { data, error } = await supabase.from("fits" as any).insert(payload).select().maybeSingle();
      if (error) throw error;
      return data as unknown as Fit;
    },
    onSuccess: () => {
      toast.success("Fit saved");
      qc.invalidateQueries({ queryKey: ["fits"] });
    },
    onError: (e: any) => toast.error(e.message || "Couldn't save fit"),
  });
}

export function useDeleteFit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fits" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fit deleted");
      qc.invalidateQueries({ queryKey: ["fits"] });
    },
  });
}

export function useToggleLike(fitId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to like fits");
      const { data: existing } = await supabase.from("fit_likes" as any).select("id").eq("fit_id", fitId).eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("fit_likes" as any).delete().eq("fit_id", fitId).eq("user_id", user.id);
        return "removed" as const;
      }
      await supabase.from("fit_likes" as any).insert({ fit_id: fitId, user_id: user.id });
      return "added" as const;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fits"] }),
    onError: (e: any) => toast.error(e.message || "Couldn't update like"),
  });
}
