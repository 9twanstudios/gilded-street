import { useState } from "react";
import { usePublicFits } from "@/hooks/use-fits";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Plus } from "lucide-react";
import SEO from "@/components/SEO";
import { QueryError } from "@/components/QueryError";
import { motion } from "framer-motion";

export default function FitsGalleryPage() {
  const [sort, setSort] = useState<"latest" | "popular" | "featured">("latest");
  const { data: fits = [], isLoading, isError, refetch } = usePublicFits(sort);

  return (
    <div className="container py-8">
      <SEO title="Community Fits — FitCheck Wall | 91Fitz" description="See how the 91Fitz community styles drops. Vote for your favorites." />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-1">Community</p>
          <h1 className="font-heading text-4xl md:text-5xl text-gold-gradient">FitCheck Wall</h1>
        </div>
        <div className="flex items-center gap-2">
          {(["latest", "popular", "featured"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded text-xs font-display font-bold uppercase tracking-wider transition-all ${
                sort === s ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "featured" && <Sparkles className="inline h-3 w-3 mr-1" />}
              {s}
            </button>
          ))}
          <Link to="/fitcheck" className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            <Plus className="h-3 w-3" /> New fit
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <QueryError message="Couldn't load community fits." onRetry={() => refetch()} />
      ) : fits.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No public fits yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {fits.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/fits/${f.id}`} className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
                <div className="aspect-[3/4] bg-surface relative">
                  {f.cover_image ? (
                    <img src={f.cover_image} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No preview</div>
                  )}
                  {f.featured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-display font-bold uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <p className="font-display font-bold text-sm text-foreground truncate">{f.name}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3.5 w-3.5" /> {f.likes_count}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
