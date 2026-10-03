import { useMemo } from "react";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SocialFeedSection } from "@/components/store/SocialFeedSection";
import { CountdownTimer } from "@/components/store/CountdownTimer";
import { AnimeSpotlightHero, type SpotlightSlide } from "@/components/store/AnimeSpotlightHero";
import { useProducts } from "@/hooks/use-products";
import { useDrops } from "@/hooks/use-drops";
import { useCreatorMap } from "@/hooks/use-creators";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { QueryError } from "@/components/QueryError";

export default function HomePage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: drops } = useDrops();
  const { data: creators } = useCreatorMap();

  const now = Date.now();
  const activeDrops = useMemo(() => (drops ?? []).filter((d) => d.active), [drops]);

  const slides = useMemo<SpotlightSlide[]>(() => {
    const out: SpotlightSlide[] = [];
    const list = products ?? [];
    const drop = activeDrops[0];
    if (drop) {
      const live = new Date(drop.drop_date).getTime() <= now;
      out.push({
        id: `drop-${drop.id}`,
        kicker: live ? "新着 // Drop Live" : "予告 // Upcoming Drop",
        title: drop.title,
        subtitle: drop.description,
        image: drop.cover_image,
        cta: { label: live ? "Shop the Drop" : "View Drop", to: `/drops/${drop.slug}` },
      });
    }
    const creator = Object.values(creators ?? {}).find((c) => c.verified) ?? Object.values(creators ?? {})[0];
    if (creator) {
      const cp = list.find((p) => p.creator_id === creator.user_id);
      out.push({ id: `creator-${creator.id}`, kicker: "職人 // Featured Creator", title: creator.brand_name, subtitle: creator.bio, image: cp?.image ?? creator.logo_url, cta: { label: "Visit Store", to: `/creator/${creator.id}` } });
    }
    // Cycle through every live product, newest first.
    const weekAgo = now - 7 * 864e5;
    for (const p of list) {
      const badge = p.badge?.toLowerCase();
      const kicker = badge && ["hot", "limited"].includes(badge)
        ? "熱狂 // Trending"
        : new Date(p.created_at).getTime() >= weekAgo
          ? "新作 // New Arrival"
          : p.creator_id ? "協力 // Collab" : "91 // Original";
      out.push({ id: `p-${p.id}`, kicker, title: p.name, subtitle: p.description, image: p.image, price: p.price, cta: { label: "Cop Now", to: `/products/${p.slug}` } });
    }
    return out;
  }, [products, activeDrops, creators, now]);

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

  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  const linked = new Set(activeDrops.flatMap((d) => d.product_ids));
  const rest = (products ?? []).filter((p) => !linked.has(p.id));

  return (
    <>
      <Helmet>
        <title>91 Fitz — Premium Nairobi Streetwear | Bold Urban Fashion Kenya</title>
        <meta name="description" content="Shop 91 Fitz premium streetwear from Nairobi, Kenya. Limited drops, bold hoodies, tees & cargo pants. M-Pesa checkout. Built in Kenya, worn worldwide." />
        <meta property="og:title" content="91 Fitz — Premium Nairobi Streetwear" />
        <meta property="og:description" content="Limited drops, premium hoodies Kenya. Bold streetwear from Nairobi." />
      </Helmet>

      <AnimeSpotlightHero slides={slides} />

      <div id="drops" className="scroll-mt-20">
        {activeDrops.map((drop) => {
          const items = drop.product_ids.map((id) => byId.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof byId.get>>[];
          const live = new Date(drop.drop_date).getTime() <= now;
          return (
            <section key={drop.id} className="border-b border-border pt-10">
              <div className="container flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-1">
                    {live ? "限定 // Live Drop" : "予告 // Dropping Soon"}
                  </p>
                  <h2 className="font-heading text-4xl md:text-5xl text-gold-gradient">{drop.title}</h2>
                  {drop.description && <p className="text-muted-foreground text-sm max-w-xl mt-1">{drop.description}</p>}
                </div>
                <div className="flex items-center gap-4">
                  {!live && <CountdownTimer targetDate={drop.drop_date} />}
                  <Link to={`/drops/${drop.slug}`} className="text-primary font-display font-bold uppercase tracking-wider text-sm hover:underline">Full drop →</Link>
                </div>
              </div>
              {items.length > 0
                ? <ProductGrid products={items} />
                : <p className="container py-8 text-muted-foreground text-sm">Merch for this drop is coming soon.</p>}
            </section>
          );
        })}
      </div>

      {rest.length > 0 && <ProductGrid products={rest} title="More Merch" />}
      <SocialFeedSection />
    </>
  );
}
