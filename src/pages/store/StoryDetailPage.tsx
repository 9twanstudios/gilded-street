import { useParams, Link } from "react-router-dom";
import { useStoryBySlug } from "@/hooks/use-stories";
import { useDrops } from "@/hooks/use-drops";
import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { track } from "@/lib/tracking";
import { useEffect } from "react";

export default function StoryDetailPage() {
  const { slug } = useParams();
  const { data: story, isLoading } = useStoryBySlug(slug);
  const { data: drops } = useDrops();
  const { data: allProducts } = useProducts();

  useEffect(() => {
    if (story) track.storyView(story.id, story.slug);
  }, [story]);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Story not found.</p>
        <Link to="/stories" className="text-primary hover:underline mt-4 inline-block">Back to Stories</Link>
      </div>
    );
  }

  const relatedDrop = drops?.find((d) => d.id === story.related_drop_id);
  const relatedProducts = allProducts?.filter((p) => story.related_product_ids.includes(p.id)) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.relevance || `Cultural story: ${story.title}`,
    image: story.cover_image,
    author: { "@type": "Organization", name: "91 Fitz" },
    publisher: { "@type": "Organization", name: "91 Fitz" },
    datePublished: story.created_at,
    dateModified: story.updated_at,
  };

  return (
    <div>
      <Helmet>
        <title>{story.title} — 91 Fitz Cultural Archive</title>
        <meta name="description" content={story.relevance || `Discover the story of ${story.figure_name || story.title} and its connection to Pan-African street culture.`} />
        <link rel="canonical" href={`https://91fitz.com/stories/${story.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      {story.cover_image && (
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={story.cover_image} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container pb-8">
            {story.era && (
              <span className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2 block">{story.era}</span>
            )}
            <h1 className="font-heading text-5xl md:text-7xl text-gold-gradient">{story.title}</h1>
            {story.figure_name && (
              <p className="text-xl text-foreground/80 mt-2 font-display">{story.figure_name}</p>
            )}
          </div>
        </div>
      )}

      <div className="container py-8">
        {!story.cover_image && (
          <>
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/stories" className="hover:text-primary transition-colors">Stories</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground truncate max-w-[200px]">{story.title}</span>
            </nav>
            <h1 className="font-heading text-5xl md:text-6xl text-gold-gradient mb-4">{story.title}</h1>
          </>
        )}

        {story.cover_image && (
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/stories" className="hover:text-primary transition-colors">Stories</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[200px]">{story.title}</span>
          </nav>
        )}

        {/* Relevance callout */}
        {story.relevance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-l-4 border-primary bg-card rounded-r-lg p-6 mb-8"
          >
            <p className="text-xs font-display font-bold uppercase tracking-wider text-primary mb-2">Why This Matters</p>
            <p className="text-foreground/90 leading-relaxed">{story.relevance}</p>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert prose-gold max-w-3xl mb-12"
        >
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
            {story.content}
          </div>
        </motion.div>

        {/* Related Drop */}
        {relatedDrop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8"
          >
            <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">Related Drop</p>
            <h2 className="font-heading text-3xl text-gold-gradient mb-3">{relatedDrop.title}</h2>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">{relatedDrop.description}</p>
            <Link
              to={`/drops/${relatedDrop.slug}`}
              className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded font-display font-bold uppercase tracking-wider text-sm hover:bg-gold-dark transition-colors"
            >
              View Drop
            </Link>
          </motion.div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductGrid products={relatedProducts} title="Shop This Story" />
        )}
      </div>
    </div>
  );
}
