import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Story {
  id: string;
  title: string;
  slug: string;
  content: string;
  figure_name: string | null;
  figure_image: string | null;
  era: string | null;
  relevance: string | null;
  related_drop_id: string | null;
  related_product_ids: string[];
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Story[];
    },
  });
}

export function useStoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["stories", "slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Story | null;
    },
    enabled: !!slug,
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (story: Omit<Story, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("stories").insert(story);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}

export function useUpdateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Story> & { id: string }) => {
      const { error } = await supabase.from("stories").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}
