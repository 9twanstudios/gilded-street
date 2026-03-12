import { HeroBanner } from "@/components/store/HeroBanner";
import { ProductGrid } from "@/components/store/ProductGrid";
import { mockProducts } from "@/lib/data";

export default function HomePage() {
  const featured = mockProducts.filter((p) => p.badge);
  return (
    <>
      <HeroBanner />
      <ProductGrid products={featured} title="Featured Drops" />
      <ProductGrid products={mockProducts} title="All Products" />
    </>
  );
}
