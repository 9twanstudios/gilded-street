import { useState } from "react";
import { useQRCampaigns, useDeleteQR, QRCampaign } from "@/hooks/use-qr";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRFormDialog from "@/components/admin/QRFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import BrandedQRCode from "@/components/BrandedQRCode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminQR() {
  const { data, isLoading } = useQRCampaigns();
  const del = useDeleteQR();
  const [edit, setEdit] = useState<QRCampaign | null>(null);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://91fitz.com";

  const handleDel = async () => {
    if (!delId) return;
    try { await del.mutateAsync(delId); toast.success("Campaign deleted"); }
    catch { toast.error("Failed"); }
    setDelId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-4xl text-gold-gradient">QR Campaigns</h1>
        <Button onClick={() => { setEdit(null); setOpen(true); }} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data?.length ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">No QR campaigns yet. Create your first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-bold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/u/{c.slug}</p>
                </div>
                <span className={`text-[10px] font-display font-bold uppercase px-2 py-1 rounded ${c.active ? "bg-green-900/30 text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {c.active ? "Live" : "Off"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.headline}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setPreviewSlug(c.slug)} className="flex-1">
                  <QrCode className="h-4 w-4 mr-1" /> QR
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEdit(c); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDelId(c.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <QRFormDialog open={open} onOpenChange={setOpen} campaign={edit} />
      <DeleteConfirmDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)} onConfirm={handleDel} title="Delete campaign" description="QR scans for this campaign will also be removed." />

      <Dialog open={!!previewSlug} onOpenChange={(o) => !o && setPreviewSlug(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-gold-gradient">Branded QR</DialogTitle>
          </DialogHeader>
          {previewSlug && (
            <div className="flex flex-col items-center">
              <BrandedQRCode value={`${baseUrl}/u/${previewSlug}`} size={320} />
              <p className="text-xs text-muted-foreground mt-3 break-all">{baseUrl}/u/{previewSlug}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
