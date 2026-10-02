import { useParams, Link } from "react-router-dom";
import { useDropBySlug } from "@/hooks/use-drops";
import { useProducts } from "@/hooks/use-products";
import { CountdownTimer } from "@/components/store/CountdownTimer";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { track } from "@/lib/tracking";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export default function DropDetailPage() {
  const { slug } = useParams();
  const { data: drop, isLoading } = useDropBySlug(slug);
  const { data: allProducts } = useProducts();
  const { addItem } = useCart();

  useEffect(() => {
    if (drop) track.dropView(drop.id, drop.slug);
  }, [drop]);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Drop not found.</p>
        <Link to="/#drops" className="text-primary hover:underline mt-4 inline-block">Back to Drops</Link>
      </div>
    );
  }

  const dropProducts = allProducts?.filter((p) => drop.product_ids.includes(p.id)) ?? [];
  const isUpcoming = new Date(drop.drop_date) > new Date();
  const isLive = !isUpcoming;

  return (
    <div>
      <Helmet>
        <title>{drop.title} — 91 Fitz Drops</title>
        <meta name="description" content={drop.description || `${drop.title} drop from 91 Fitz streetwear.`} />
        <link rel="canonical" href={`https://91fitz.com/drops/${drop.slug}`} />
      </Helmet>

      {/* Full-bleed Hero */}
      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        {drop.cover_image ? (
          <img src={drop.cover_image} alt={drop.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container pb-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {isLive ? (
              <span className="inline-block bg-neon text-neon-foreground px-3 py-1 rounded text-xs font-display font-bold uppercase tracking-wider mb-3">🔥 Live Now</span>
            ) : (
              <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded text-xs font-display font-bold uppercase tracking-wider mb-3">Upcoming</span>
            )}
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-gold-gradient mb-3">{drop.title}</h1>
            <p className="text-foreground/80 text-lg md:text-xl max-w-xl mb-6">{drop.description}</p>
            <div className="flex flex-wrap gap-4 items-center">
              {isLive ? (
                <Button asChild size="lg" className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold">
                  <a href="#drop-products">Shop Drop</a>
                </Button>
              ) : (
                <CountdownTimer targetDate={drop.drop_date} />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-12">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/#drops" className="hover:text-primary transition-colors">Drops</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-[200px]">{drop.title}</span>
        </nav>

        {/* Cultural Story Section */}

        {/* Product Lineup */}
        {dropProducts.length > 0 && (
          <div id="drop-products">
            <ProductGrid products={dropProducts} title="Drop Products" />
          </div>
        )}
      </div>
    </div>
  );
}
