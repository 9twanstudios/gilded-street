import { Link } from "react-router-dom";
import { formatPrice } from "@/hooks/use-products";
import { motion } from "framer-motion";

export interface ProductCardData {
  id: string;
  name: string;
  slug?: string;
  price: number;
  original_price?: number | null;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string | null;
  sizes: string[];
  in_stock?: boolean;
  inStock?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  index?: number;
}

const badgeColors: Record<string, string> = {
  NEW: "bg-primary text-primary-foreground",
  New: "bg-primary text-primary-foreground",
  LIMITED: "bg-destructive text-destructive-foreground",
  Limited: "bg-destructive text-destructive-foreground",
  SALE: "bg-gold-dark text-primary-foreground",
  Sale: "bg-gold-dark text-primary-foreground",
  Hot: "bg-destructive text-destructive-foreground",
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const origPrice = product.original_price ?? product.originalPrice;
  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={productUrl}
        className="group block bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold"
      >
        <div className="relative aspect-square overflow-hidden bg-surface">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-display font-bold uppercase tracking-wider rounded ${badgeColors[product.badge] ?? "bg-muted text-muted-foreground"}`}>
              {product.badge}
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-200 mb-2 truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-primary font-display font-bold">{formatPrice(product.price)}</span>
            {origPrice && (
              <span className="text-muted-foreground text-sm line-through">{formatPrice(origPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
