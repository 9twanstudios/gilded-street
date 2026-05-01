import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateQR, useUpdateQR, QRCampaign } from "@/hooks/use-qr";
import { generateSlug } from "@/hooks/use-products";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  campaign: QRCampaign | null;
}

export default function QRFormDialog({ open, onOpenChange, campaign }: Props) {
  const create = useCreateQR();
  const update = useUpdateQR();
  const [form, setForm] = useState({
    slug: "", name: "", description: "", campaign_type: "custom",
    hero_image: "", headline: "", subheadline: "",
    cta_label: "Shop Now", cta_url: "/shop", active: true,
  });

  useEffect(() => {
    if (campaign) setForm({
      slug: campaign.slug, name: campaign.name, description: campaign.description ?? "",
      campaign_type: campaign.campaign_type, hero_image: campaign.hero_image ?? "",
      headline: campaign.headline, subheadline: campaign.subheadline ?? "",
      cta_label: campaign.cta_label, cta_url: campaign.cta_url, active: campaign.active,
    });
    else setForm({ slug: "", name: "", description: "", campaign_type: "custom", hero_image: "", headline: "", subheadline: "", cta_label: "Shop Now", cta_url: "/shop", active: true });
  }, [campaign, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = form.slug || generateSlug(form.name);
      if (campaign) await update.mutateAsync({ id: campaign.id, ...form, slug });
      else await create.mutateAsync({ ...form, slug });
      toast.success(campaign ? "Updated" : "Campaign created");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-foreground">{campaign ? "Edit" : "New"} QR Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })} required className="bg-surface border-border" />
          <Input placeholder="Slug (used in /u/slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="bg-surface border-border" />
          <Input placeholder="Hero image URL" value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} className="bg-surface border-border" />
          <Input placeholder="Headline (big gold text)" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} required className="bg-surface border-border" />
          <Input placeholder="Subheadline" value={form.subheadline} onChange={(e) => setForm({ ...form, subheadline: e.target.value })} className="bg-surface border-border" />
          <Textarea placeholder="Story / description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="bg-surface border-border" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="CTA label" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} className="bg-surface border-border" />
            <Input placeholder="CTA url" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} className="bg-surface border-border" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <span className="text-sm text-foreground">Active</span>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            {campaign ? "Update" : "Create"} Campaign
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
