import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useCreateStory, useUpdateStory } from "@/hooks/use-stories";
import type { Story } from "@/hooks/use-stories";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: Story | null;
}

export function StoryFormDialog({ open, onOpenChange, story }: Props) {
  const create = useCreateStory();
  const update = useUpdateStory();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    figure_name: "",
    figure_image: "",
    era: "",
    relevance: "",
    cover_image: "",
    related_drop_id: "",
    published: false,
  });

  useEffect(() => {
    if (story) {
      setForm({
        title: story.title,
        slug: story.slug,
        content: story.content,
        figure_name: story.figure_name || "",
        figure_image: story.figure_image || "",
        era: story.era || "",
        relevance: story.relevance || "",
        cover_image: story.cover_image || "",
        related_drop_id: story.related_drop_id || "",
        published: story.published,
      });
    } else {
      setForm({ title: "", slug: "", content: "", figure_name: "", figure_image: "", era: "", relevance: "", cover_image: "", related_drop_id: "", published: false });
    }
  }, [story, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        figure_name: form.figure_name || null,
        figure_image: form.figure_image || null,
        era: form.era || null,
        relevance: form.relevance || null,
        cover_image: form.cover_image || null,
        related_drop_id: form.related_drop_id || null,
        related_product_ids: [] as string[],
      };

      if (story) {
        await update.mutateAsync({ id: story.id, ...payload });
        toast.success("Story updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Story created");
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save story");
    }
  };

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-gold-gradient">{story ? "Edit Story" : "New Story"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Title *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} required className="bg-input border-border" />
            </div>
            <div>
              <Label className="text-muted-foreground">Slug *</Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required className="bg-input border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Figure Name</Label>
              <Input value={form.figure_name} onChange={(e) => set("figure_name", e.target.value)} className="bg-input border-border" />
            </div>
            <div>
              <Label className="text-muted-foreground">Era</Label>
              <Input value={form.era} onChange={(e) => set("era", e.target.value)} placeholder="e.g. 1949–1987" className="bg-input border-border" />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Figure Image URL</Label>
            <Input value={form.figure_image} onChange={(e) => set("figure_image", e.target.value)} className="bg-input border-border" />
          </div>
          <div>
            <Label className="text-muted-foreground">Cover Image URL</Label>
            <Input value={form.cover_image} onChange={(e) => set("cover_image", e.target.value)} className="bg-input border-border" />
          </div>
          <div>
            <Label className="text-muted-foreground">Relevance (cultural connection)</Label>
            <Textarea value={form.relevance} onChange={(e) => set("relevance", e.target.value)} rows={2} className="bg-input border-border" />
          </div>
          <div>
            <Label className="text-muted-foreground">Content *</Label>
            <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={8} required className="bg-input border-border" />
          </div>
          <div>
            <Label className="text-muted-foreground">Related Drop ID</Label>
            <Input value={form.related_drop_id} onChange={(e) => set("related_drop_id", e.target.value)} placeholder="UUID" className="bg-input border-border" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
            <Label className="text-foreground">Published</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
              {story ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
