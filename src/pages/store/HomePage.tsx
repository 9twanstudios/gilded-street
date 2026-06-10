import { HeroBanner } from "@/components/store/HeroBanner";
import { ProductGrid } from "@/components/store/ProductGrid";
import { EcosystemSection } from "@/components/store/EcosystemSection";
import { SocialFeedSection } from "@/components/store/SocialFeedSection";
import { NewsletterSignup } from "@/components/store/NewsletterSignup";
import { CountdownTimer } from "@/components/store/CountdownTimer";
import { useProducts } from "@/hooks/use-products";
import { useDrops } from "@/hooks/use-drops";
import { useStories } from "@/hooks/use-stories";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { QueryError } from "@/components/QueryError";

export default function HomePage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: drops } = useDrops();
  const { data: stories } = useStories();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError && !products) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <QueryError message="Couldn't load the store. Check your connection and try again." onRetry={() => refetch()} />
      </div>
    );
  }

  const now = new Date();
  const activeDrops = drops?.filter((d) => d.active) ?? [];
  const latestDrop = activeDrops[0];
  const upcomingDrop = drops?.find((d) => new Date(d.drop_date) > now);
  const recentDrops = activeDrops.slice(0, 3);
  const latestStory = stories?.find((s) => s.published);
  const featured = products?.filter((p) => p.badge) ?? [];

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

      {/* Upcoming Drop Countdown */}
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

      {/* Featured Collections (Recent Drops) */}
      {recentDrops.length > 0 && (
        <section className="py-12 border-b border-border">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">Collections</p>
              <h2 className="font-heading text-3xl md:text-4xl text-gold-gradient mb-8">Latest Drops</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDrops.map((drop, i) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/drops/${drop.slug}`} className="group block">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface mb-3 relative">
                      {drop.cover_image ? (
                        <img src={drop.cover_image} alt={drop.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-surface flex items-center justify-center">
                          <span className="font-heading text-5xl text-primary/30">{drop.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-heading text-2xl text-foreground group-hover:text-primary transition-colors">{drop.title}</h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cultural Story Teaser */}
      {latestStory && (
        <section className="py-12 border-b border-border">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {latestStory.cover_image && (
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-surface">
                  <img src={latestStory.cover_image} alt={latestStory.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">Cultural Archive</p>
                <h2 className="font-heading text-3xl md:text-4xl text-gold-gradient mb-3">{latestStory.title}</h2>
                {latestStory.figure_name && (
                  <p className="text-foreground/80 font-display mb-2">{latestStory.figure_name} {latestStory.era && `· ${latestStory.era}`}</p>
                )}
                {latestStory.relevance && (
                  <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">{latestStory.relevance}</p>
                )}
                <Link
                  to={`/stories/${latestStory.slug}`}
                  className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded font-display font-bold uppercase tracking-wider text-sm hover:bg-gold-dark transition-colors"
                >
                  Read Story
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {featured.length > 0 && <ProductGrid products={featured} title="Featured Drops" />}
      <ProductGrid products={products ?? []} title="All Products" />
      <SocialFeedSection />

      <section className="py-12">
        <div className="container max-w-lg">
          <NewsletterSignup />
        </div>
      </section>

      <EcosystemSection />
    </>
  );
}
