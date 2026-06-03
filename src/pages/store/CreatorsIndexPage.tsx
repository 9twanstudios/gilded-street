import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";

export default function CreatorsIndexPage() {
  const { data } = useQuery({
    queryKey: ["creators-public"],
    queryFn: async () => {
      const { data, error } = await supabase.from("creators").select("id, brand_name, bio, logo_url, verified, creator_tier" as any).eq("verified", true);
      if (error) throw error; return data || [];
    },
  });
  return (
    <div className="container py-10">
      <SEO title="Creators | 91Fitz" description="Discover the Pan-African creators powering 91Fitz drops." />
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Creators</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(data ?? []).map((c: any) => (
          <Link key={c.id} to={`/creator/${c.id}`} className="bg-card border border-border rounded-lg p-5 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-surface overflow-hidden">{c.logo_url && <img src={c.logo_url} alt="" className="w-full h-full object-cover" />}</div>
              <div>
                <h3 className="font-display font-bold text-foreground">{c.brand_name}</h3>
                {c.creator_tier && <Badge variant="outline" className="border-primary text-primary text-[10px] uppercase">{c.creator_tier}</Badge>}
              </div>
            </div>
            {c.bio && <p className="text-muted-foreground text-sm line-clamp-2">{c.bio}</p>}
          </Link>
        ))}
        {(!data || data.length === 0) && <p className="text-muted-foreground text-sm">No verified creators yet.</p>}
      </div>
    </div>
  );
}
