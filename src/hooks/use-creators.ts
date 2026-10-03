import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreatorLite {
  id: string;
  user_id: string;
  brand_name: string;
  bio: string | null;
  logo_url: string | null;
  verified: boolean;
}

/** All creators, keyed by user_id (products.creator_id references creators.user_id). */
export function useCreatorMap() {
  return useQuery({
    queryKey: ["creator-map"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creators")
        .select("id, user_id, brand_name, bio, logo_url, verified");
      if (error) throw error;
      const map: Record<string, CreatorLite> = {};
      (data ?? []).forEach((c) => { map[c.user_id] = c as CreatorLite; });
      return map;
    },
  });
}
