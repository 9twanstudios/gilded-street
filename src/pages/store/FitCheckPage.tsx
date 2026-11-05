import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2, Plus, Share2, ShoppingBag } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useLooks, useLookProducts, useMyLikes, useToggleLike } from "@/hooks/use-fitcheck";
import { useAuth } from "@/hooks/use-auth";
import type { Look } from "@/hooks/use-fitcheck";
import { formatPrice } from "@/lib/format";

/** One 9:16 look card: full-bleed media, Big Up, and Shop This Fit product chips. */
function LookCard({ look }: { look: Look }) {
  const [shopOpen, setShopOpen] = useState(false);
  const { user } = useAuth();
  const { data: liked } = useMyLikes();
  const toggleLike = useToggleLike();
  const isLiked = liked?.has(look.id) ?? false;
  const { data: products, isLoading: loadingProducts } = useLookProducts(shopOpen ? look.product_ids : []);

  const share = async () => {
    const url = `${window.location.origin}/fitcheck`;
    const text = `${look.caption ?? look.name} — FitCheck on 91 Fitz`;
    if (navigator.share) await navigator.share({ title: "FitCheck — 91 Fitz", text, url }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
  };

  return (
    <article className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border bg-card">
      <img src={look.cover_image ?? ""} alt={look.caption ?? look.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-3 pt-10">
        <p className="line-clamp-2 font-display text-sm font-semibold uppercase tracking-wide">{look.caption ?? look.name}</p>
        {(look.estate || look.vibe) && (
          <p className="mt-0.5 text-xs text-muted-foreground">{[look.estate, look.vibe].filter(Boolean).join(" · ")}</p>
        )}
      </div>
      <div className="absolute right-2 top-2 flex flex-col gap-2">
        <button
          type="button"
          aria-label={isLiked ? "Remove Big Up" : "Give a Big Up"}
          aria-pressed={isLiked}
          onClick={() => toggleLike.mutate({ id: look.id, liked: isLiked })}
          disabled={!user || toggleLike.isPending}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur ${isLiked ? "text-primary" : "text-foreground"}`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} aria-hidden />
        </button>
        <span className="text-center text-[11px] font-bold text-foreground">{look.likes_count}</span>
        <button
          type="button"
          aria-label="Share this look"
          onClick={share}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur text-foreground"
        >
          <Share2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {look.product_ids.length > 0 && (
        <div className="absolute inset-x-3 bottom-[4.25rem]">
          {shopOpen ? (
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-background/90 p-2 backdrop-blur">
              {loadingProducts ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin text-primary" aria-hidden />
              ) : (
                products?.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.slug}`}
                    className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={p.image} alt="" className="h-9 w-9 rounded object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{p.name}</span>
                    <span className="text-xs font-bold text-primary">{formatPrice(p.price)}</span>
                  </Link>
                ))
              )}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setShopOpen((v) => !v)}
            aria-expanded={shopOpen}
            className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-background/85 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary backdrop-blur"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            {shopOpen ? "Hide the fit" : "Shop this fit"}
          </button>
        </div>
      )}
    </article>
  );
}

export default function FitCheckPage() {
  const { data: looks, isLoading } = useLooks();

  return (
    <div className="mx-auto max-w-xl px-4 pb-24">
      <SEO
        title="FitCheck"
        description="FitCheck is the 91 Fitz creator discovery engine — post your fit, tag the merch, shop the looks. Nairobi streetwear, worn worldwide."
        canonical="https://9twanfitz.vercel.app/fitcheck"
      />
      <header className="flex items-center justify-between py-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-primary">FitCheck</h1>
          <p className="text-sm text-muted-foreground">The discovery engine. Wear it, post it, shop it.</p>
        </div>
        <Button asChild size="sm" className="font-display uppercase tracking-widest">
          <Link to="/fitcheck/post" aria-label="Post a look">
            <Plus className="mr-1 h-4 w-4" aria-hidden /> Post
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        </div>
      ) : !looks?.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-lg font-bold uppercase tracking-wider">No looks yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Be the first to post. Show Nairobi how you wear the uniform.
          </p>
          <Button asChild className="mt-4 font-display uppercase tracking-widest">
            <Link to="/fitcheck/post">Post the first look</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {looks.map((look) => (
            <LookCard key={look.id} look={look} />
          ))}
        </div>
      )}
    </div>
  );
}
