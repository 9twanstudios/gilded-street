import { ProductCard, ProductCardData } from "./ProductCard";
import { useState } from "react";
import { QuickViewModal } from "./QuickViewModal";
import { Product } from "@/hooks/use-products";

interface ProductGridProps {
  products: ProductCardData[];
  title?: string;
}

export function ProductGrid({ products, title }: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <section className="py-12">
      <div className="container">
        {title && (
          <h2 className="font-heading text-4xl md:text-5xl text-gold-gradient mb-8">{title}</h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onQuickView={(p) => setQuickViewProduct(p as unknown as Product)}
            />
          ))}
        </div>
      </div>
      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => { if (!open) setQuickViewProduct(null); }}
      />
    </section>
  );
}
