import { Copy, Share2, Gift } from "lucide-react";
import { toast } from "sonner";
import { useMyReferralCode, useMyReferrals } from "@/hooks/use-referrals";
import { formatKES } from "@/hooks/use-wallet";

export default function InviteTab() {
  const { data: code } = useMyReferralCode();
  const { data: referrals } = useMyReferrals();
  const link = code ? `${window.location.origin}/r/${code}` : "";

  const totalEarned = (referrals ?? []).reduce((s, r) => s + (r.reward_amount || 0), 0);
  const converted = (referrals ?? []).filter((r) => r.status === "rewarded").length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Gift className="h-10 w-10 text-primary mx-auto mb-3" />
        <h2 className="font-heading text-3xl text-gold-gradient mb-2">Invite & Earn</h2>
        <p className="text-muted-foreground text-sm">Share your code. Earn from every converted invite.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Invites" value={referrals?.length ?? 0} />
        <Stat label="Converted" value={converted} />
        <Stat label="Earned" value={formatKES(totalEarned)} />
      </div>

      <div className="bg-surface-elevated border border-primary/30 rounded-lg p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Your code</p>
        <p className="font-heading text-4xl text-primary mb-4">{code ?? "—"}</p>
        <div className="flex items-center gap-2">
          <input readOnly value={link} className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground" />
          <button
            onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded font-display font-bold uppercase text-xs flex items-center gap-2 hover:bg-gold-dark"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button
            onClick={async () => {
              if (navigator.share) await navigator.share({ title: "91 Fitz", text: "Get fitted with 91 Fitz", url: link });
              else { navigator.clipboard.writeText(link); toast.success("Link copied"); }
            }}
            className="px-4 py-2 border border-primary text-primary rounded font-display font-bold uppercase text-xs flex items-center gap-2 hover:bg-primary/10"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>

      {!!referrals?.length && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground">Date</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground">Status</th>
                <th className="text-right p-3 text-xs uppercase text-muted-foreground">Reward</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 text-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-muted-foreground uppercase text-xs">{r.status}</td>
                  <td className="p-3 text-right text-primary font-bold">{formatKES(r.reward_amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-4 border border-border rounded-lg text-center">
      <p className="text-2xl font-heading text-foreground">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
