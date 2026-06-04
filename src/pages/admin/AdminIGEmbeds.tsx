import { useState } from "react";
import { useAdminIGEmbeds, useUpsertIGEmbed, useDeleteIGEmbed, type IGEmbed } from "@/hooks/use-ig-embeds";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";

export default function AdminIGEmbeds() {
  const { data: embeds = [], isLoading } = useAdminIGEmbeds();
  const upsert = useUpsertIGEmbed();
  const del = useDeleteIGEmbed();
  const [draft, setDraft] = useState<Partial<IGEmbed>>({ scope: "home_featured", post_url: "", caption: "", order: 0, active: true });

  return (
    <div>
      <PageHeader title="Instagram Embeds" subtitle="Curate IG posts for the homepage and creator pages." />

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-3">Add embed</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <select
            className="bg-surface border border-border rounded px-3 py-2 text-sm"
            value={draft.scope}
            onChange={(e) => setDraft({ ...draft, scope: e.target.value as any })}
          >
            <option value="home_featured">Home (featured)</option>
            <option value="creator">Creator page</option>
          </select>
          <Input placeholder="Post URL (https://instagram.com/p/...)" value={draft.post_url || ""} onChange={(e) => setDraft({ ...draft, post_url: e.target.value })} />
          <Textarea placeholder="Caption (optional)" value={draft.caption || ""} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} className="md:col-span-2" rows={2} />
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <span className="text-xs text-muted-foreground">Active</span>
            <Switch checked={draft.active ?? true} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
            <Button
              onClick={async () => {
                if (!draft.post_url) return;
                await upsert.mutateAsync(draft);
                setDraft({ scope: "home_featured", post_url: "", caption: "", order: 0, active: true });
              }}
              className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? <p className="p-4 text-muted-foreground text-sm">Loading…</p> : embeds.length === 0 ? (
          <p className="p-4 text-muted-foreground text-sm">No embeds yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left p-3">Scope</th><th className="text-left p-3">URL</th><th className="text-left p-3">Caption</th><th className="text-left p-3">Active</th><th></th></tr>
            </thead>
            <tbody>
              {embeds.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="p-3 font-display uppercase text-xs">{e.scope}</td>
                  <td className="p-3"><a href={e.post_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate inline-block max-w-xs">{e.post_url}</a></td>
                  <td className="p-3 text-muted-foreground">{e.caption}</td>
                  <td className="p-3"><Switch checked={e.active} onCheckedChange={(v) => upsert.mutate({ id: e.id, active: v })} /></td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => del.mutate(e.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
