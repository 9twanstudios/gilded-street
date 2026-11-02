import { useState } from "react";
import { useDrops, useCreateDrop, useUpdateDrop, useDeleteDrop, Drop } from "@/hooks/use-drops";
import { generateSlug } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDrops() {
  const { data: drops, isLoading } = useDrops();
  const createDrop = useCreateDrop();
  const updateDrop = useUpdateDrop();
  const deleteDrop = useDeleteDrop();
  const { data: products } = useQuery({
    queryKey: ["admin-drop-products"],
    queryFn: async () => (await supabase.from("products").select("id,name,image").order("created_at", { ascending: false })).data ?? [],
  });
  const [editDrop, setEditDrop] = useState<Drop | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", slug: "", description: "", cover_image: "", drop_date: "", active: true, product_ids: [] as string[],
  });

  const openNew = () => {
    setEditDrop(null);
    setForm({ title: "", slug: "", description: "", cover_image: "", drop_date: "", active: true, product_ids: [] });
    setIsOpen(true);
  };

  const openEdit = (drop: Drop) => {
    setEditDrop(drop);
    setForm({
      title: drop.title,
      slug: drop.slug,
      description: drop.description || "",
      cover_image: drop.cover_image || "",
      drop_date: drop.drop_date ? (() => { const d = new Date(drop.drop_date); return isNaN(d.getTime()) ? "" : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); })() : "",
      active: drop.active,
      product_ids: drop.product_ids,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || generateSlug(form.title);
    const parsed = form.drop_date ? new Date(form.drop_date) : null;
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!parsed || isNaN(parsed.getTime())) { toast.error("Please pick a valid drop date and time"); return; }
    const payload = { ...form, slug, drop_date: parsed.toISOString() };

    try {
      if (editDrop) {
        await updateDrop.mutateAsync({ id: editDrop.id, ...payload });
        toast.success("Drop updated");
      } else {
        await createDrop.mutateAsync(payload);
        toast.success("Drop created");
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err?.message ? `Failed to save drop: ${err.message}` : "Failed to save drop");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDrop.mutateAsync(deleteId);
      toast.success("Drop deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-4xl text-gold-gradient">Drops</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
              <Plus className="h-4 w-4 mr-2" /> New Drop
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl text-foreground">{editDrop ? "Edit" : "New"} Drop</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} required className="bg-surface border-border" />
              <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-surface border-border" />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-surface border-border" rows={3} />
              <MediaUploader value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} folder="drops" label="Drop cover" />
              <div>
                <p className="mb-2 text-xs font-display uppercase tracking-wider text-muted-foreground">Merch in this drop ({form.product_ids.length})</p>
                <div className="max-h-44 space-y-1 overflow-y-auto rounded border border-border p-2">
                  {(products ?? []).map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                      <Checkbox checked={form.product_ids.includes(p.id)} onCheckedChange={(c) => setForm({ ...form, product_ids: c ? [...form.product_ids, p.id] : form.product_ids.filter((x) => x !== p.id) })} />
                      <img src={p.image} alt="" className="h-7 w-7 rounded object-cover" />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Input type="datetime-local" value={form.drop_date} onChange={(e) => setForm({ ...form, drop_date: e.target.value })} required className="bg-surface border-border" />
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
                <span className="text-sm text-foreground">Active</span>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
                {editDrop ? "Update" : "Create"} Drop
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-right p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drops?.map((drop) => (
                <tr key={drop.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{drop.title}</td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(drop.drop_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${drop.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {drop.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(drop)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(drop.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Drop"
        description="This will permanently delete this drop."
      />
    </div>
  );
}
