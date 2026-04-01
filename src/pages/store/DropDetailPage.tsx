import { useParams, Link } from "react-router-dom";
import { useDropBySlug } from "@/hooks/use-drops";
import { useProducts } from "@/hooks/use-products";
import { CountdownTimer } from "@/components/store/CountdownTimer";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function DropDetailPage() {
  const { slug } = useParams();
  const { data: drop, isLoading } = useDropBySlug(slug);
  const { data: allProducts } = useProducts();

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
        <Link to="/drops" className="text-primary hover:underline mt-4 inline-block">Back to Drops</Link>
      </div>
    );
  }

  const dropProducts = allProducts?.filter((p) => drop.product_ids.includes(p.id)) ?? [];

  return (
    <div className="container py-8">
      <Helmet>
        <title>{drop.title} — 9twanfitz Drops</title>
        <meta name="description" content={drop.description || `${drop.title} drop from 9twanfitz streetwear.`} />
      </Helmet>

      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/drops" className="hover:text-primary transition-colors">Drops</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[200px]">{drop.title}</span>
      </nav>

      {drop.cover_image && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[3/1] rounded-lg overflow-hidden mb-8">
          <img src={drop.cover_image} alt={drop.title} className="w-full h-full object-cover" />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-4xl md:text-5xl text-gold-gradient mb-4">{drop.title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">{drop.description}</p>
        <CountdownTimer targetDate={drop.drop_date} className="mb-8" />
      </motion.div>

      {dropProducts.length > 0 && (
        <ProductGrid products={dropProducts} title="Drop Products" />
      )}
    </div>
  );
}
