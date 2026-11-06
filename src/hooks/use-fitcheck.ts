import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Product } from "@/hooks/use-products";

/** A FitCheck look. Stored in the canonical `fits` table; products link to the one catalogue. */
export interface Look {
  id: string;
  user_id: string;
  name: string;
  caption: string | null;
  cover_image: string | null;
  media_type: string;
  estate: string | null;
  vibe: string | null;
  product_ids: string[];
  likes_count: number;
  featured: boolean;
  created_at: string;
}

const db = supabase as any;

export function useLooks(userId?: string) {
  return useQuery({
    queryKey: ["looks", userId ?? "all"],
    queryFn: async () => {
      let q = db.from("fits")
        .select("id,user_id,name,caption,cover_image,media_type,estate,vibe,product_ids,likes_count,featured,created_at")
        .eq("visibility", "public").not("cover_image", "is", null)
        .order("created_at", { ascending: false }).limit(60);
      if (userId) q = q.eq("user_id", userId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Look[];
    },
    refetchOnWindowFocus: true,
  });
}

/** Map of user_id → creator brand name, used to badge creator posts in the feed. */
export function useCreatorPosters() {
  return useQuery({
    queryKey: ["creator-posters"],
    queryFn: async () => {
      const { data } = await supabase.from("creators").select("user_id,brand_name");
      return new Map<string, string>((data ?? []).map((c: any) => [c.user_id, c.brand_name]));
    },
    staleTime: 5 * 60_000,
  });
}

export function useLookProducts(ids: string[]) {
  return useQuery({
    queryKey: ["look-products", ids.join(",")],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase.from("products").select("*").in("id", ids).eq("status", "approved");
      if (error) throw error;
      return data as unknown as Product[];
    },
    enabled: ids.length > 0,
  });
}

export function useMyLikes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["look-likes", user?.id],
    queryFn: async () => {
      const { data } = await db.from("fit_likes").select("fit_id").eq("user_id", user!.id);
      return new Set<string>((data ?? []).map((r: any) => r.fit_id));
    },
    enabled: !!user,
  });
}

export function useToggleLike() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }) => {
      if (!user) throw new Error("Sign in to like looks");
      const { error } = liked
        ? await db.from("fit_likes").delete().eq("fit_id", id).eq("user_id", user.id)
        : await db.from("fit_likes").insert({ fit_id: id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["look-likes"] });
      qc.invalidateQueries({ queryKey: ["looks"] });
    },
  });
}

export function useCreateLook() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { cover_image: string; caption: string; estate?: string; vibe?: string; product_ids: string[] }) => {
      if (!user) throw new Error("Sign in to post");
      const { error } = await db.from("fits").insert({
        user_id: user.id, name: v.caption.slice(0, 80) || "FitCheck", caption: v.caption,
        cover_image: v.cover_image, estate: v.estate || null, vibe: v.vibe || null,
        product_ids: v.product_ids, visibility: "public", media_type: "image",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["looks"] }),
  });
}
