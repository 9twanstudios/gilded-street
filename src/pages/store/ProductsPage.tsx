import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "@/components/store/ProductGrid";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    if (!products) return ["All"];
    return ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const filtered = useMemo(
    () => category === "All" ? (products ?? []) : (products ?? []).filter((p) => p.category === category),
    [category, products]
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-20" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-heading text-5xl md:text-6xl text-gold-gradient mb-6">Shop</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-display font-semibold uppercase tracking-wider transition-all duration-200 ${
              category === cat
                ? "bg-primary text-primary-foreground shadow-gold"
                : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ProductGrid products={filtered} />
    </div>
  );
}
