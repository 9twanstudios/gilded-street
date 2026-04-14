import { useStories, useDeleteStory } from "@/hooks/use-stories";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { StoryFormDialog } from "@/components/admin/StoryFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { toast } from "sonner";
import type { Story } from "@/hooks/use-stories";

export default function AdminStories() {
  const { data: stories, isLoading } = useStories();
  const deleteMutation = useDeleteStory();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Story | null>(null);
  const [deleting, setDeleting] = useState<Story | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success("Story deleted");
    } catch {
      toast.error("Failed to delete story");
    }
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl text-gold-gradient">Stories</h1>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
          <Plus className="h-4 w-4 mr-2" /> New Story
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !stories?.length ? (
        <p className="text-muted-foreground text-center py-20">No stories yet. Create one to get started.</p>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 font-display font-bold uppercase tracking-wider text-muted-foreground text-xs">Title</th>
                <th className="p-3 font-display font-bold uppercase tracking-wider text-muted-foreground text-xs hidden md:table-cell">Figure</th>
                <th className="p-3 font-display font-bold uppercase tracking-wider text-muted-foreground text-xs hidden md:table-cell">Era</th>
                <th className="p-3 font-display font-bold uppercase tracking-wider text-muted-foreground text-xs">Status</th>
                <th className="p-3 font-display font-bold uppercase tracking-wider text-muted-foreground text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="p-3 text-foreground font-medium">{story.title}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{story.figure_name || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{story.era || "—"}</td>
                  <td className="p-3">
                    {story.published ? (
                      <span className="flex items-center gap-1 text-neon text-xs font-display font-bold"><Eye className="h-3 w-3" /> Live</span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground text-xs font-display font-bold"><EyeOff className="h-3 w-3" /> Draft</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(story); setFormOpen(true); }} className="text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleting(story)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StoryFormDialog open={formOpen} onOpenChange={setFormOpen} story={editing} />
      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Story"
        description={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
