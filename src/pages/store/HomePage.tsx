import { HeroBanner } from "@/components/store/HeroBanner";
import { ProductGrid } from "@/components/store/ProductGrid";
import { EcosystemSection } from "@/components/store/EcosystemSection";
import { SocialFeedSection } from "@/components/store/SocialFeedSection";
import { NewsletterSignup } from "@/components/store/NewsletterSignup";
import { CountdownTimer } from "@/components/store/CountdownTimer";
import { useProducts } from "@/hooks/use-products";
import { useDrops } from "@/hooks/use-drops";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function HomePage() {
  const { data: products, isLoading } = useProducts();
  const { data: drops } = useDrops();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const featured = products?.filter((p) => p.badge) ?? [];
  const upcomingDrop = drops?.find((d) => new Date(d.drop_date) > new Date());

  return (
    <>
      <Helmet>
        <title>91 Fitz — Premium Nairobi Streetwear | Bold Urban Fashion Kenya</title>
        <meta name="description" content="Shop 91 Fitz premium streetwear from Nairobi, Kenya. Limited drops, bold hoodies, tees & cargo pants. M-Pesa checkout. Built in Kenya, worn worldwide." />
        <meta property="og:title" content="91 Fitz — Premium Nairobi Streetwear" />
        <meta property="og:description" content="Limited drops, premium hoodies Kenya. Bold streetwear from Nairobi." />
        <link rel="canonical" href="https://91fitz.com" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "91 Fitz",
          description: "Premium streetwear brand from Nairobi, Kenya",
          url: "https://91fitz.com",
          address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
          priceRange: "KES 1000 - KES 15000",
          image: "https://91fitz.com/og-image.jpg",
        })}</script>
      </Helmet>

      <HeroBanner />

      {/* Upcoming Drop Banner */}
      {upcomingDrop && (
        <section className="py-10 border-b border-border">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-lg p-6 md:p-8 text-center"
            >
              <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">Upcoming Drop</p>
              <h2 className="font-heading text-3xl md:text-4xl text-gold-gradient mb-3">{upcomingDrop.title}</h2>
              <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">{upcomingDrop.description}</p>
              <div className="flex justify-center mb-5">
                <CountdownTimer targetDate={upcomingDrop.drop_date} />
              </div>
              <Link
                to={`/drops/${upcomingDrop.slug}`}
                className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded font-display font-bold uppercase tracking-wider text-sm hover:bg-gold-dark transition-colors"
              >
                View Drop
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      <ProductGrid products={featured} title="Featured Drops" />
      <ProductGrid products={products ?? []} title="All Products" />
      <SocialFeedSection />

      {/* Newsletter */}
      <section className="py-12">
        <div className="container max-w-lg">
          <NewsletterSignup />
        </div>
      </section>

      <EcosystemSection />
    </>
  );
}
