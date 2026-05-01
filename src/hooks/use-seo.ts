import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SEOCluster {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  h1: string;
  hero_image: string | null;
  body_md: string;
  keywords: string[];
  related_product_ids: string[];
  related_drop_ids: string[];
  related_story_ids: string[];
  published: boolean;
}
export interface SEOLocation {
  id: string;
  slug: string;
  city: string;
  country: string;
  title: string;
  meta_description: string;
  hero_image: string | null;
  body_md: string;
  local_cta_label: string;
  local_cta_url: string;
  shipping_note: string;
  published: boolean;
}

export function useClusters() {
  return useQuery({
    queryKey: ["seo-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_clusters" as any).select("*").order("slug");
      if (error) throw error;
      return data as unknown as SEOCluster[];
    },
  });
}
export function useCluster(slug?: string) {
  return useQuery({
    queryKey: ["seo-cluster", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_clusters" as any).select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data as unknown as SEOCluster | null;
    },
    enabled: !!slug,
  });
}
export function useLocations() {
  return useQuery({
    queryKey: ["seo-locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_locations" as any).select("*").order("slug");
      if (error) throw error;
      return data as unknown as SEOLocation[];
    },
  });
}
export function useLocation(slug?: string) {
  return useQuery({
    queryKey: ["seo-location", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_locations" as any).select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data as unknown as SEOLocation | null;
    },
    enabled: !!slug,
  });
}

function makeMutations(table: "seo_clusters" | "seo_locations", key: string) {
  return {
    create: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: async (input: any) => {
          const { data, error } = await supabase.from(table as any).insert(input).select().single();
          if (error) throw error;
          return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      });
    },
    update: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: async ({ id, ...patch }: any) => {
          const { data, error } = await supabase.from(table as any).update(patch).eq("id", id).select().single();
          if (error) throw error;
          return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      });
    },
    remove: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: async (id: string) => {
          const { error } = await supabase.from(table as any).delete().eq("id", id);
          if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      });
    },
  };
}

const clusterMut = makeMutations("seo_clusters", "seo-clusters");
const locMut = makeMutations("seo_locations", "seo-locations");
export const useCreateCluster = clusterMut.create;
export const useUpdateCluster = clusterMut.update;
export const useDeleteCluster = clusterMut.remove;
export const useCreateLocation = locMut.create;
export const useUpdateLocation = locMut.update;
export const useDeleteLocation = locMut.remove;
