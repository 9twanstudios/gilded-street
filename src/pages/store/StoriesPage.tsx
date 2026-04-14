import { useStories } from "@/hooks/use-stories";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";

export default function StoriesPage() {
  const { data: stories, isLoading } = useStories();

  const published = stories?.filter((s) => s.published) ?? [];

  return (
    <div className="container py-8">
      <Helmet>
        <title>Cultural Stories — 91 Fitz | Pan-African Street Culture Archive</title>
        <meta name="description" content="Explore the cultural stories behind 91 Fitz. Pan-African icons, Nairobi street culture, and the figures who inspire our drops." />
        <link rel="canonical" href="https://91fitz.com/stories" />
      </Helmet>

      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Stories</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">Cultural Archive</p>
        <h1 className="font-heading text-5xl md:text-6xl text-gold-gradient mb-4">Stories</h1>
        <p className="text-muted-foreground max-w-2xl mb-10">The icons, movements, and streets that shape our identity. Every drop has a story — here's where they live.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : published.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Stories coming soon.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/stories/${story.slug}`} className="group block">
                <div className="aspect-[4/5] rounded-lg overflow-hidden bg-surface mb-3 relative">
                  {story.cover_image ? (
                    <img
                      src={story.cover_image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-surface flex items-center justify-center">
                      <span className="font-heading text-6xl text-primary/30">{story.title[0]}</span>
                    </div>
                  )}
                  {story.era && (
                    <span className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-display font-bold uppercase tracking-wider text-primary">
                      {story.era}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary transition-colors">{story.title}</h3>
                {story.figure_name && (
                  <p className="text-sm text-muted-foreground mt-1">{story.figure_name}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
