import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PostType = "article" | "story" | "drop_note";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  article: "Article",
  story: "Story",
  drop_note: "Drop Note",
};

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: string;
  published: boolean;
  tags: string[];
  related_product_ids: string[];
  post_type: PostType;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useBlogPosts(includeUnpublished = false) {
  return useQuery({
    queryKey: ["blog-posts", includeUnpublished],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includeUnpublished) {
        query = query.eq("published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["blog-posts", "slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as BlogPost | null;
    },
    enabled: !!slug,
  });
}
