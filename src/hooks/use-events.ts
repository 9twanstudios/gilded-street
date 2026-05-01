import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEventsSummary(days = 7) {
  return useQuery({
    queryKey: ["events-summary", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("events" as any)
        .select("event_type, created_at")
        .gte("created_at", since)
        .limit(10000);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r: any) => { counts[r.event_type] = (counts[r.event_type] || 0) + 1; });
      return { total: (data ?? []).length, byType: counts };
    },
  });
}

export function useRecentEvents(limit = 100) {
  return useQuery({
    queryKey: ["events-recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as any[];
    },
  });
}
