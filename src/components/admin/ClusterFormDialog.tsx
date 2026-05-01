import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateCluster, useUpdateCluster, SEOCluster } from "@/hooks/use-seo";
import { generateSlug } from "@/hooks/use-products";
import { toast } from "sonner";

export default function ClusterFormDialog({ open, onOpenChange, cluster }: { open: boolean; onOpenChange: (o: boolean) => void; cluster: SEOCluster | null }) {
  const create = useCreateCluster();
  const update = useUpdateCluster();
  const [form, setForm] = useState({ slug: "", title: "", meta_description: "", h1: "", hero_image: "", body_md: "", keywords: "", published: true });

  useEffect(() => {
    if (cluster) setForm({
      slug: cluster.slug, title: cluster.title, meta_description: cluster.meta_description,
      h1: cluster.h1, hero_image: cluster.hero_image ?? "", body_md: cluster.body_md,
      keywords: cluster.keywords?.join(", ") ?? "", published: cluster.published,
    });
    else setForm({ slug: "", title: "", meta_description: "", h1: "", hero_image: "", body_md: "", keywords: "", published: true });
  }, [cluster, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.h1),
        keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      };
      if (cluster) await update.mutateAsync({ id: cluster.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success("Saved");
      onOpenChange(false);
    } catch (err: any) { toast.error(err.message ?? "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-heading text-2xl text-foreground">{cluster ? "Edit" : "New"} cluster</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="H1 (page heading)" value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value, slug: form.slug || generateSlug(e.target.value) })} required className="bg-surface border-border" />
          <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="bg-surface border-border" />
          <Input placeholder="SEO title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-surface border-border" />
          <Textarea placeholder="Meta description" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={2} className="bg-surface border-border" />
          <Input placeholder="Hero image URL" value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} className="bg-surface border-border" />
          <Input placeholder="Keywords (comma separated)" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="bg-surface border-border" />
          <Textarea placeholder="Body (markdown)" value={form.body_md} onChange={(e) => setForm({ ...form, body_md: e.target.value })} rows={8} className="bg-surface border-border font-mono text-sm" />
          <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><span className="text-sm">Published</span></div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
