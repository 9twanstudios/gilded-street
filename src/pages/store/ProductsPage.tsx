import { useState, useMemo } from "react";
import { mockProducts } from "@/lib/data";
import { ProductGrid } from "@/components/store/ProductGrid";

const categories = ["All", ...Array.from(new Set(mockProducts.map((p) => p.category)))];

export default function ProductsPage() {
  const [category, setCategory] = useState("All");

  const filtered = useMemo(
    () => category === "All" ? mockProducts : mockProducts.filter((p) => p.category === category),
    [category]
  );

  return (
    <div className="container py-8">
      <h1 className="font-heading text-5xl md:text-6xl text-gold-gradient mb-6">Shop</h1>

      {/* Filters */}
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
