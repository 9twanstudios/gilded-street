import { Link } from "react-router-dom";
import { Product, formatPrice } from "@/lib/data";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const badgeColors: Record<string, string> = {
  NEW: "bg-primary text-primary-foreground",
  LIMITED: "bg-destructive text-destructive-foreground",
  SALE: "bg-gold-dark text-primary-foreground",
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={`/products/${product.id}`}
        className="group block bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-display font-bold uppercase tracking-wider rounded ${badgeColors[product.badge]}`}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-200 mb-2 truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-primary font-display font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-sm line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
