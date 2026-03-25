import { useState } from "react";
import { useCategories, generateSlug } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

interface EditingCategory {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EditingCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const slug = editing.slug || generateSlug(editing.name);
    const payload = {
      name: editing.name.trim(),
      slug,
      description: editing.description || null,
      image: editing.image || null,
    };

    const { error } = editing.id
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editing.id ? "Category updated" : "Category added");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-4xl text-gold-gradient">Categories</h1>
        <Button
          onClick={() => setEditing({ name: "", slug: "", description: "", image: "" })}
          className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6 space-y-4">
          <h2 className="font-display font-bold text-foreground">
            {editing.id ? "Edit Category" : "New Category"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : generateSlug(e.target.value) })}
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1 block">Slug</label>
              <Input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="bg-background border-border"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
            <Textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={2}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1 block">Image URL</label>
            <Input
              value={editing.image}
              onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              placeholder="Optional"
              className="bg-background border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="border-border text-muted-foreground">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Slug</th>
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Description</th>
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
            ) : categories?.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-muted-foreground text-center">No categories yet</td></tr>
            ) : (
              categories?.map((cat) => (
                <tr key={cat.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{cat.name}</td>
                  <td className="p-4 text-sm text-muted-foreground font-mono">{cat.slug}</td>
                  <td className="p-4 text-sm text-muted-foreground truncate max-w-[200px]">{cat.description || "—"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description || "", image: cat.image || "" })}
                        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Products using this category won't be affected.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
