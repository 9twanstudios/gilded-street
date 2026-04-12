import { Link } from "react-router-dom";
import { formatPrice } from "@/hooks/use-products";
import { motion } from "framer-motion";
import { WishlistButton } from "@/components/store/WishlistButton";
import { StarRatingDisplay } from "@/components/store/ReviewSection";
import { ShoppingBag, Eye } from "lucide-react";
import { useState, useRef } from "react";
import { useCart } from "@/hooks/use-cart";
import confetti from "canvas-confetti";

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
  description?: string | null;
}

interface ProductCardProps {
  product: ProductCardData;
  index?: number;
  onQuickView?: (product: ProductCardData) => void;
}

const badgeColors: Record<string, string> = {
  NEW: "bg-neon text-neon-foreground",
  New: "bg-neon text-neon-foreground",
  LIMITED: "bg-destructive text-destructive-foreground",
  Limited: "bg-destructive text-destructive-foreground",
  SALE: "bg-gold-dark text-primary-foreground",
  Sale: "bg-gold-dark text-primary-foreground",
  Hot: "bg-destructive text-destructive-foreground",
};

export function ProductCard({ product, index = 0, onQuickView }: ProductCardProps) {
  const origPrice = product.original_price ?? product.originalPrice;
  const productUrl = `/products/${product.slug || product.id}`;
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShowQuickAdd(false);
    setSelectedSize("");
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) {
      setShowQuickAdd(true);
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: origPrice ?? undefined,
        image: product.image,
        category: product.category,
        badge: product.badge as any,
        description: (product as any).description ?? "",
        sizes: product.sizes,
        inStock: product.in_stock ?? product.inStock ?? true,
      },
      selectedSize
    );
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.8 }, colors: ["#FFD700", "#00E676"] });
    setAdded(true);
    setTimeout(() => { setAdded(false); setSelectedSize(""); setShowQuickAdd(false); }, 1200);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: "transform 0.15s ease-out" }}
      className="will-change-transform"
    >
      <Link
        to={productUrl}
        className="group block bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-gold"
      >
        <div className="relative aspect-square overflow-hidden bg-surface">
          <img
            src={product.image}
            alt={`${product.name} — 91 Fitz Nairobi streetwear`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-display font-bold uppercase tracking-wider rounded ${badgeColors[product.badge] ?? "bg-muted text-muted-foreground"}`}>
              {product.badge}
            </span>
          )}
          <WishlistButton productId={product.id} className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm rounded-full p-1.5" size="sm" />

          {/* Quick action overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background/90 to-transparent">
            {showQuickAdd ? (
              <div className="flex flex-wrap gap-1 justify-center" onClick={(e) => e.preventDefault()}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(s); }}
                    className={`min-w-[2rem] h-6 px-1.5 rounded text-[10px] font-display font-bold transition-all ${
                      selectedSize === s ? "bg-primary text-primary-foreground" : "bg-surface text-foreground hover:bg-primary/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {selectedSize && (
                  <button
                    onClick={handleQuickAdd}
                    className={`h-6 px-2 rounded text-[10px] font-display font-bold ${added ? "bg-neon text-neon-foreground" : "bg-primary text-primary-foreground"}`}
                  >
                    {added ? "✓" : "Add"}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-1 justify-center">
                <button
                  onClick={handleQuickAdd}
                  className="h-7 px-3 rounded bg-primary text-primary-foreground text-[10px] font-display font-bold uppercase flex items-center gap-1"
                >
                  <ShoppingBag className="h-3 w-3" /> Quick Add
                </button>
                {onQuickView && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                    className="h-7 px-2 rounded bg-surface text-foreground text-[10px] font-display font-bold flex items-center gap-1 hover:bg-surface-elevated"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-200 mb-1 truncate">
            {product.name}
          </h3>
          <StarRatingDisplay productId={product.id} />
          <div className="flex items-center gap-2 mt-1">
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
