/**
 * LDX v12.1 admin audit log — writes admin.action.v1 events to the immutable
 * `events` table. Fire-and-forget; never blocks UI.
 */
import { supabase } from "@/integrations/supabase/client";

export type AdminAction =
  | "product.approved"
  | "product.rejected"
  | "product.deleted"
  | "withdrawal.approved"
  | "withdrawal.rejected"
  | "settings.updated"
  | "drop.created"
  | "drop.updated"
  | "qr.created"
  | "seo.updated"
  | "user.role_changed";

export async function logAdminAction(
  action: AdminAction,
  targetId: string | null,
  meta: Record<string, unknown> = {},
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("events" as any).insert({
      event_type: "admin.action.v1",
      user_id: user.id,
      session_id: null,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      properties: { action, target_id: targetId, ...meta } as any,
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[admin-audit] failed", action, err);
  }
}
