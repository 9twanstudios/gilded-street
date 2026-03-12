import { useParams, Link } from "react-router-dom";
import { useProduct, useProducts, formatPrice } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/store/ProductGrid";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Link to="/products" className="text-primary hover:underline mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const recommended = allProducts?.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4) ?? [];

  const handleAddToCart = () => {
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
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div className="container py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="aspect-square rounded-lg overflow-hidden bg-surface">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          {product.badge && (
            <span className="text-xs font-display font-bold uppercase tracking-wider text-primary mb-2">{product.badge}</span>
          )}
          <p className="text-sm text-muted-foreground uppercase tracking-wider">{product.category}</p>
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mt-1 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-primary font-heading text-3xl">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-muted-foreground line-through text-lg">{formatPrice(product.original_price)}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

          <div className="mb-6">
            <p className="text-sm font-display font-bold uppercase tracking-wider text-foreground mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] h-10 px-3 rounded border text-sm font-display font-semibold transition-all duration-200 ${
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && <p className="text-xs text-muted-foreground mt-2">Select a size to continue</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`flex-1 font-display font-bold uppercase tracking-wider transition-all duration-300 ${
                added
                  ? "bg-green-600 text-foreground gold-pulse"
                  : "bg-primary text-primary-foreground hover:bg-gold-dark shadow-gold hover:shadow-gold-lg"
              }`}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {added ? "Added!" : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={!selectedSize}
              className="flex-1 border-primary text-primary font-display font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              asChild
            >
              <Link to="/checkout">Buy Now</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {recommended.length > 0 && (
        <ProductGrid products={recommended} title="You May Also Like" />
      )}
    </div>
  );
}
