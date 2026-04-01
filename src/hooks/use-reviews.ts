import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles(full_name, avatar_url)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}

export function useAverageRating(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", "avg", productId],
    queryFn: async () => {
      if (!productId) return { avg: 0, count: 0 };
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);
      if (error) throw error;
      if (!data || data.length === 0) return { avg: 0, count: 0 };
      const sum = data.reduce((s, r) => s + r.rating, 0);
      return { avg: sum / data.length, count: data.length };
    },
    enabled: !!productId,
  });
}

export function useSubmitReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("reviews").upsert(
        { user_id: user.id, product_id: productId, rating, comment, updated_at: new Date().toISOString() },
        { onConflict: "user_id,product_id" }
      );
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.productId] });
      queryClient.invalidateQueries({ queryKey: ["reviews", "avg", vars.productId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
