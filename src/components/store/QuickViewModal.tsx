import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { formatPrice, Product } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    if (!selectedSize) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price ?? undefined,
        image: product.image,
        category: product.category,
        badge: product.badge as any,
        description: product.description ?? "",
        sizes: product.sizes,
        inStock: product.in_stock,
      },
      selectedSize
    );
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ["#FFD700", "#00E676", "#FFFFFF"] });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelectedSize("");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border p-0 overflow-hidden">
        <DialogTitle className="sr-only">{product.name} — Quick View</DialogTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="aspect-square bg-surface">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-5 flex flex-col">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
            <h3 className="font-heading text-2xl text-foreground mt-1">{product.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-primary font-heading text-2xl">{formatPrice(product.price)}</span>
              {product.original_price && (
                <span className="text-muted-foreground line-through text-sm">{formatPrice(product.original_price)}</span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-3 line-clamp-3">{product.description}</p>

            <div className="mt-4">
              <p className="text-xs font-display font-bold uppercase tracking-wider text-foreground mb-2">Size</p>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[2.5rem] h-8 px-2 rounded border text-xs font-display font-semibold transition-all ${
                      selectedSize === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!selectedSize}
                className={`font-display font-bold uppercase tracking-wider ${
                  added ? "bg-neon text-neon-foreground" : "bg-primary text-primary-foreground hover:bg-gold-dark"
                }`}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {added ? "Added! 🎉" : "Add to Cart"}
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Link to={`/products/${product.slug}`} onClick={() => onOpenChange(false)}>
                  View Full Details →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
