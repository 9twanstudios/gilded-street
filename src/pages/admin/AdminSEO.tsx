import { useState } from "react";
import { useClusters, useDeleteCluster, useLocations, useDeleteLocation, SEOCluster, SEOLocation } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import ClusterFormDialog from "@/components/admin/ClusterFormDialog";
import LocationFormDialog from "@/components/admin/LocationFormDialog";

export default function AdminSEO() {
  const { data: clusters } = useClusters();
  const { data: locations } = useLocations();
  const delC = useDeleteCluster();
  const delL = useDeleteLocation();
  const [editC, setEditC] = useState<SEOCluster | null>(null);
  const [editL, setEditL] = useState<SEOLocation | null>(null);
  const [openC, setOpenC] = useState(false);
  const [openL, setOpenL] = useState(false);
  const [delTarget, setDelTarget] = useState<{ type: "c" | "l"; id: string } | null>(null);

  const handleDel = async () => {
    if (!delTarget) return;
    try {
      if (delTarget.type === "c") await delC.mutateAsync(delTarget.id);
      else await delL.mutateAsync(delTarget.id);
      toast.success("Deleted");
    } catch { toast.error("Failed"); }
    setDelTarget(null);
  };

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">SEO Pages</h1>
      <Tabs defaultValue="clusters">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="clusters"><Globe className="h-4 w-4 mr-2" /> Clusters</TabsTrigger>
          <TabsTrigger value="locations"><MapPin className="h-4 w-4 mr-2" /> Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="clusters" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button onClick={() => { setEditC(null); setOpenC(true); }} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
              <Plus className="h-4 w-4 mr-2" /> New cluster
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clusters?.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-bold text-foreground">{c.h1}</p>
                    <p className="text-xs text-muted-foreground">/c/{c.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditC(c); setOpenC(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDelTarget({ type: "c", id: c.id })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locations" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button onClick={() => { setEditL(null); setOpenL(true); }} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
              <Plus className="h-4 w-4 mr-2" /> New location
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locations?.map((l) => (
              <div key={l.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-bold text-foreground">{l.city}, {l.country}</p>
                    <p className="text-xs text-muted-foreground">/l/{l.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditL(l); setOpenL(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDelTarget({ type: "l", id: l.id })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ClusterFormDialog open={openC} onOpenChange={setOpenC} cluster={editC} />
      <LocationFormDialog open={openL} onOpenChange={setOpenL} location={editL} />
      <DeleteConfirmDialog open={!!delTarget} onOpenChange={(o) => !o && setDelTarget(null)} onConfirm={handleDel} title="Delete page" description="This SEO page will no longer be reachable." />
    </div>
  );
}
