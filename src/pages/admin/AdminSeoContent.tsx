import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Page {
  id: string; url: string; entity_type: string; title: string | null;
  description: string | null; index_status: string; structured_data: any;
  last_crawled_at: string | null;
}

function score(p: Page): { value: number; issues: string[] } {
  const issues: string[] = [];
  let s = 100;
  if (!p.title || p.title.length < 20) { s -= 20; issues.push("Title too short"); }
  if (p.title && p.title.length > 60) { s -= 10; issues.push("Title >60 chars"); }
  if (!p.description || p.description.length < 80) { s -= 20; issues.push("Description too short"); }
  if (p.description && p.description.length > 160) { s -= 10; issues.push("Description >160 chars"); }
  if (!p.structured_data || Object.keys(p.structured_data).length === 0) { s -= 20; issues.push("Missing JSON-LD"); }
  if (p.index_status === "noindex" || p.index_status === "blocked") { s -= 30; issues.push("Not indexable"); }
  return { value: Math.max(0, s), issues };
}

export default function AdminSeoContent() {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("seo_pages").select("*").order("updated_at", { ascending: false }).limit(200);
      setPages((data as any) || []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl text-gold-gradient">SEO Content Quality</h1>
        <p className="text-muted-foreground">Per-page quality score & "what to fix".</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Pages</CardTitle></CardHeader>
        <CardContent>
          {pages.length === 0 && <p className="text-sm text-muted-foreground">No pages snapshotted yet. Run sitemap generator or save a product/drop to populate.</p>}
          <div className="space-y-3">
            {pages.map((p) => {
              const sc = score(p);
              const color = sc.value >= 80 ? "bg-success" : sc.value >= 50 ? "bg-yellow-600" : "bg-destructive";
              return (
                <div key={p.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-display font-bold text-foreground truncate">{p.title || "(no title)"}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.url}</div>
                    </div>
                    <Badge className={`${color} text-white`}>{sc.value}</Badge>
                  </div>
                  {sc.issues.length > 0 && (
                    <ul className="text-xs text-muted-foreground list-disc pl-5">
                      {sc.issues.map((i) => <li key={i}>{i}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
