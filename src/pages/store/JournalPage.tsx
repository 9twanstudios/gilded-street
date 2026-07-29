import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useBlogPosts, POST_TYPE_LABELS, type PostType } from "@/hooks/use-blog";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";

const TABS: { key: "all" | PostType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "story", label: "Stories" },
  { key: "article", label: "Articles" },
  { key: "drop_note", label: "Drop Notes" },
];

export default function JournalPage() {
  const { data: posts, isLoading } = useBlogPosts();
  const [params, setParams] = useSearchParams();

  const activeType = (params.get("type") ?? "all") as "all" | PostType;
  const activeTag = params.get("tag");

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    (posts ?? []).forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    let list = posts ?? [];
    if (activeType !== "all") list = list.filter((p) => p.post_type === activeType);
    if (activeTag) list = list.filter((p) => p.tags?.includes(activeTag));
    return list;
  }, [posts, activeType, activeTag]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider transition-all duration-200 ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-surface text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="container py-8">
      <SEO
        title="Journal — Stories, Articles & Drop Notes | 91Fitz"
        description="Pan-African streetwear culture from Nairobi: liberation stories, styling articles, and notes from every 91Fitz drop."
      />

      <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-1">91Fitz Journal</p>
      <h1 className="font-heading text-5xl md:text-6xl text-gold-gradient mb-2">Journal</h1>
      <p className="text-muted-foreground mb-8 max-w-xl">
        Liberation stories, styling articles, and drop notes — one feed, the whole movement.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setParam("type", t.key === "all" ? null : t.key)}
            className={chip(activeType === t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setParam("tag", null)} className={chip(!activeTag)}>
            All tags
          </button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setParam("tag", tag)} className={chip(activeTag === tag)}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Nothing here yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.06 }}
            >
              <Link
                to={`/journal/${post.slug}`}
                className="group block h-full bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold"
              >
                <div className="relative aspect-video overflow-hidden bg-surface">
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-1 rounded bg-background/80 backdrop-blur text-[10px] font-display font-bold uppercase tracking-wider text-primary">
                    {POST_TYPE_LABELS[post.post_type] ?? "Article"}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {post.tags?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {post.tags[0]}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
