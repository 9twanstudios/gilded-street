import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useBlogPosts } from "@/hooks/use-blog";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";

export default function BlogPage() {
  const { data: posts, isLoading } = useBlogPosts();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (!selectedTag) return posts;
    return posts.filter((p) => p.tags.includes(selectedTag));
  }, [posts, selectedTag]);

  return (
    <div className="container py-8">
      <Helmet>
        <title>Fashion Tips & Style Guide — 9twanfitz Blog</title>
        <meta name="description" content="Streetwear styling tips, outfit ideas, and fashion advice from 9twanfitz. Nairobi urban fashion at its finest." />
        <meta property="og:title" content="9twanfitz Blog — Fashion Tips & Style Guide" />
        <meta property="og:description" content="Streetwear styling tips and outfit ideas from Nairobi." />
      </Helmet>

      <h1 className="font-heading text-5xl md:text-6xl text-gold-gradient mb-2">Blog</h1>
      <p className="text-muted-foreground mb-8 max-w-xl">Fashion tips, styling advice, and streetwear culture from 9twanfitz.</p>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider transition-all duration-200 ${
              !selectedTag ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider transition-all duration-200 ${
                selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
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
          <p className="text-muted-foreground text-lg">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group block bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold"
              >
                {post.cover_image && (
                  <div className="aspect-video overflow-hidden bg-surface">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    {post.tags.length > 0 && (
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
