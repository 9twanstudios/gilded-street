import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCluster } from "@/hooks/use-seo";
import { useProducts } from "@/hooks/use-products";
import { track } from "@/lib/tracking";
import SEO from "@/components/SEO";
import { ProductCard } from "@/components/store/ProductCard";

export default function ClusterPage() {
  const { cluster } = useParams();
  const { data, isLoading } = useCluster(cluster);
  const { data: allProducts } = useProducts();

  useEffect(() => { if (cluster) track.clusterView(cluster); }, [cluster]);

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  if (!data) return <div className="container py-20 text-center"><h1 className="font-heading text-3xl text-foreground">Page not found</h1></div>;

  const linked = (allProducts ?? []).filter((p: any) => data.related_product_ids?.includes(p.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.h1,
    description: data.meta_description,
    keywords: data.keywords?.join(", "),
  };

  return (
    <div className="bg-background">
      <SEO title={data.title} description={data.meta_description} image={data.hero_image ?? undefined} jsonLd={jsonLd} />

      <section className="relative py-20 border-b border-border">
        {data.hero_image && (
          <div className="absolute inset-0 z-0">
            <img src={data.hero_image} alt={data.h1} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          </div>
        )}
        <div className="container relative z-10 max-w-4xl">
          <h1 className="font-heading text-5xl md:text-7xl text-gold-gradient mb-4">{data.h1}</h1>
          <p className="text-lg text-foreground/80 max-w-2xl">{data.meta_description}</p>
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        <div className="prose prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
          {data.body_md}
        </div>
      </section>

      {linked.length > 0 && (
        <section className="container py-16 border-t border-border">
          <h2 className="font-heading text-3xl text-foreground mb-8">Related Drops</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {linked.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="container py-16 border-t border-border text-center">
        <Link to="/drops" className="inline-block px-8 py-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors">
          See All Drops
        </Link>
      </section>
    </div>
  );
}
