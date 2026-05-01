import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QRCampaign {
  id: string;
  slug: string;
  name: string;
  description: string;
  campaign_type: string;
  target_id: string | null;
  target_slug: string | null;
  hero_image: string | null;
  headline: string;
  subheadline: string;
  cta_label: string;
  cta_url: string;
  variant: string;
  variant_of: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useQRCampaigns() {
  return useQuery({
    queryKey: ["qr-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("qr_campaigns" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as QRCampaign[];
    },
  });
}

export function useQRCampaign(slug?: string) {
  return useQuery({
    queryKey: ["qr-campaign", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("qr_campaigns" as any).select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data as unknown as QRCampaign | null;
    },
    enabled: !!slug,
  });
}

export function useCreateQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<QRCampaign>) => {
      const { data, error } = await supabase.from("qr_campaigns" as any).insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qr-campaigns"] }),
  });
}

export function useUpdateQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<QRCampaign> & { id: string }) => {
      const { data, error } = await supabase.from("qr_campaigns" as any).update(patch as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qr-campaigns"] }),
  });
}

export function useDeleteQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("qr_campaigns" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qr-campaigns"] }),
  });
}

export function useQRScans(campaignId?: string) {
  return useQuery({
    queryKey: ["qr-scans", campaignId],
    queryFn: async () => {
      let q = supabase.from("qr_scans" as any).select("*").order("scanned_at", { ascending: false }).limit(500);
      if (campaignId) q = q.eq("campaign_id", campaignId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
    enabled: campaignId !== undefined,
  });
}

export async function logQRScan(campaignId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("qr_scans" as any).insert({
      campaign_id: campaignId,
      user_id: user?.id ?? null,
      session_id: typeof sessionStorage !== "undefined" ? sessionStorage.getItem("91fitz_session_id") : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    });
  } catch {}
}
