import { HeroBanner } from "@/components/store/HeroBanner";
import { ProductGrid } from "@/components/store/ProductGrid";
import { useProducts } from "@/hooks/use-products";

export default function HomePage() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const featured = products?.filter((p) => p.badge) ?? [];

  return (
    <>
      <HeroBanner />
      <ProductGrid products={featured} title="Featured Drops" />
      <ProductGrid products={products ?? []} title="All Products" />
    </>
  );
}
