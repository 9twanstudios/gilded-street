import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateLocation, useUpdateLocation, SEOLocation } from "@/hooks/use-seo";
import { generateSlug } from "@/hooks/use-products";
import { toast } from "sonner";

export default function LocationFormDialog({ open, onOpenChange, location }: { open: boolean; onOpenChange: (o: boolean) => void; location: SEOLocation | null }) {
  const create = useCreateLocation();
  const update = useUpdateLocation();
  const [form, setForm] = useState({ slug: "", city: "", country: "", title: "", meta_description: "", hero_image: "", body_md: "", local_cta_label: "Shop the Drop", local_cta_url: "/drops", shipping_note: "", published: true });

  useEffect(() => {
    if (location) setForm({
      slug: location.slug, city: location.city, country: location.country,
      title: location.title, meta_description: location.meta_description,
      hero_image: location.hero_image ?? "", body_md: location.body_md,
      local_cta_label: location.local_cta_label ?? "Shop the Drop",
      local_cta_url: location.local_cta_url ?? "/drops",
      shipping_note: location.shipping_note ?? "", published: location.published,
    });
    else setForm({ slug: "", city: "", country: "", title: "", meta_description: "", hero_image: "", body_md: "", local_cta_label: "Shop the Drop", local_cta_url: "/drops", shipping_note: "", published: true });
  }, [location, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, slug: form.slug || generateSlug(form.city) };
      if (location) await update.mutateAsync({ id: location.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success("Saved");
      onOpenChange(false);
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-heading text-2xl text-foreground">{location ? "Edit" : "New"} location</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, slug: form.slug || generateSlug(e.target.value) })} required className="bg-surface border-border" />
            <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required className="bg-surface border-border" />
          </div>
          <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="bg-surface border-border" />
          <Input placeholder="SEO title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-surface border-border" />
          <Textarea placeholder="Meta description" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={2} className="bg-surface border-border" />
          <Input placeholder="Hero image URL" value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} className="bg-surface border-border" />
          <Textarea placeholder="Body (markdown)" value={form.body_md} onChange={(e) => setForm({ ...form, body_md: e.target.value })} rows={6} className="bg-surface border-border font-mono text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="CTA label" value={form.local_cta_label} onChange={(e) => setForm({ ...form, local_cta_label: e.target.value })} className="bg-surface border-border" />
            <Input placeholder="CTA url" value={form.local_cta_url} onChange={(e) => setForm({ ...form, local_cta_url: e.target.value })} className="bg-surface border-border" />
          </div>
          <Input placeholder="Shipping note" value={form.shipping_note} onChange={(e) => setForm({ ...form, shipping_note: e.target.value })} className="bg-surface border-border" />
          <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><span className="text-sm">Published</span></div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
