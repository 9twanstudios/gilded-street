import { useState } from "react";
import { useBlogPosts } from "@/hooks/use-blog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BlogFormDialog } from "@/components/admin/BlogFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

export default function AdminBlog() {
  const { data: posts, isLoading } = useBlogPosts(true);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editPost, setEditPost] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("blog_posts").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    }
    setDeleteTarget(null);
  };

  const togglePublish = async (id: string, published: boolean) => {
    const { error } = await supabase.from("blog_posts").update({ published: !published }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(published ? "Post unpublished" : "Post published");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-4xl text-gold-gradient">Blog Posts</h1>
        <Button
          onClick={() => { setEditPost(null); setFormOpen(true); }}
          className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Tags</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : posts?.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">No blog posts yet</td></tr>
              ) : (
                posts?.map((post) => (
                  <tr key={post.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {post.cover_image && (
                          <img src={post.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                        )}
                        <span className="text-sm font-medium text-foreground">{post.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        post.published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {post.tags.slice(0, 2).join(", ") || "—"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePublish(post.id, post.published)}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title={post.published ? "Unpublish" : "Publish"}
                        >
                          {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => { setEditPost(post); setFormOpen(true); }}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
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
      </div>

      <BlogFormDialog open={formOpen} onOpenChange={setFormOpen} post={editPost} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Post"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
