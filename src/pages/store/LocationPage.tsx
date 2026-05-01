import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Truck } from "lucide-react";
import { useLocation as useSEOLocation } from "@/hooks/use-seo";
import { track } from "@/lib/tracking";
import SEO from "@/components/SEO";

export default function LocationPage() {
  const { location } = useParams();
  const { data, isLoading } = useSEOLocation(location);

  useEffect(() => { if (location) track.localView(location); }, [location]);

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;
  if (!data) return <div className="container py-20 text-center"><h1 className="font-heading text-3xl text-foreground">Location not found</h1></div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `91 Fitz — ${data.city}`,
    description: data.meta_description,
    address: { "@type": "PostalAddress", addressLocality: data.city, addressCountry: data.country },
  };

  return (
    <div className="bg-background">
      <SEO title={data.title} description={data.meta_description} image={data.hero_image ?? undefined} jsonLd={jsonLd} />

      <section className="relative py-20 border-b border-border">
        {data.hero_image && (
          <div className="absolute inset-0 z-0">
            <img src={data.hero_image} alt={data.city} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          </div>
        )}
        <div className="container relative z-10 max-w-4xl">
          <p className="text-primary font-display uppercase tracking-[0.3em] text-xs mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {data.country}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl text-gold-gradient mb-4">{data.title.split("|")[0].trim()}</h1>
          <p className="text-lg text-foreground/80">{data.meta_description}</p>
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        <div className="prose prose-invert max-w-none text-foreground/80 whitespace-pre-line leading-relaxed">{data.body_md}</div>

        {data.shipping_note && (
          <div className="mt-10 p-5 border border-primary/30 bg-primary/5 rounded-lg flex gap-3">
            <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/90">{data.shipping_note}</p>
          </div>
        )}
      </section>

      <section className="container py-16 border-t border-border text-center">
        <Link to={data.local_cta_url || "/drops"} className="inline-block px-8 py-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors">
          {data.local_cta_label || "Shop the Drop"}
        </Link>
      </section>
    </div>
  );
}
