import { useParams, Link } from "react-router-dom";
import { useProductBySlug, useProduct, useProducts, formatPrice } from "@/hooks/use-products";
import { useDrops } from "@/hooks/use-drops";
import { useStories } from "@/hooks/use-stories";
import { useCart } from "@/hooks/use-cart";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/store/ProductGrid";
import { RelatedCarousel } from "@/components/store/RelatedCarousel";
import { WhatsAppButton, buildProductMessage } from "@/components/store/WhatsAppButton";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ReviewSection } from "@/components/store/ReviewSection";
import { SizeGuideModal } from "@/components/store/SizeGuideModal";
import { NotifyMeForm } from "@/components/store/NotifyMeForm";
import { Helmet } from "react-helmet-async";
import confetti from "canvas-confetti";
import { track } from "@/lib/tracking";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: productBySlug, isLoading: loadingSlug } = useProductBySlug(slug);
  const { data: productById, isLoading: loadingId } = useProduct(!productBySlug && !loadingSlug ? slug : undefined);
  const product = productBySlug || productById;
  const isLoading = loadingSlug || (!productBySlug && loadingId);

  const { data: allProducts } = useProducts();
  const { data: drops } = useDrops();
  const { data: stories } = useStories();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) track.productView(product.id);
  }, [product]);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Link to="/products" className="text-primary hover:underline mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const recommended = allProducts?.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 12) ?? [];

  // Find which drop this product belongs to
  const productDrop = drops?.find((d) => d.product_ids.includes(product.id));
  const dropStories = stories?.filter((s) => s.published && productDrop && s.related_drop_id === productDrop.id) ?? [];
  const completeTheLook = productDrop
    ? (allProducts?.filter((p) => p.id !== product.id && productDrop.product_ids.includes(p.id)).slice(0, 12) ?? [])
    : [];

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price ?? undefined,
        image: product.image,
        category: product.category,
        badge: product.badge as any,
        description: product.description ?? "",
        sizes: product.sizes,
        inStock: product.in_stock,
      },
      selectedSize
    );
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#FFD700", "#00E676", "#FFFFFF"] });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: [product.image],
    description: product.description || `Shop ${product.name} — premium Kenyan streetwear by 91 Fitz.`,
    brand: { "@type": "Brand", name: "91 Fitz" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "KES",
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "91 Fitz" },
    },
  };

  return (
    <div className="container py-8">
      <Helmet>
        <title>{product.name} — 91 Fitz Premium Streetwear Kenya</title>
        <meta name="description" content={product.description || `Shop ${product.name} — premium hoodies Kenya, Nairobi streetwear by 91 Fitz. M-Pesa checkout.`} />
        <meta property="og:title" content={`${product.name} — 91 Fitz`} />
        <meta property="og:description" content={product.description || `Shop ${product.name} at 91 Fitz. Premium streetwear from Nairobi.`} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={`https://91fitz.com/products/${product.slug}`} />
        <link rel="canonical" href={`https://91fitz.com/products/${product.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="aspect-square rounded-lg overflow-hidden bg-surface">
          <img src={product.image} alt={`${product.name} — 91 Fitz Nairobi streetwear`} className="w-full h-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              {product.badge && (
                <span className="text-xs font-display font-bold uppercase tracking-wider text-neon mb-2 block">{product.badge}</span>
              )}
              <p className="text-sm text-muted-foreground uppercase tracking-wider">{product.category}</p>
            </div>
            <WishlistButton productId={product.id} size="md" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mt-1 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-primary font-heading text-3xl">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-muted-foreground line-through text-lg">{formatPrice(product.original_price)}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          {product.in_stock ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-display font-bold uppercase tracking-wider text-foreground">Size</p>
                  <SizeGuideModal />
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-10 px-3 rounded border text-sm font-display font-semibold transition-all duration-200 ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && <p className="text-xs text-muted-foreground mt-2">Select a size to continue</p>}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className={`flex-1 font-display font-bold uppercase tracking-wider transition-all duration-300 ${
                      added
                        ? "bg-neon text-neon-foreground"
                        : "bg-primary text-primary-foreground hover:bg-gold-dark shadow-gold hover:shadow-gold-lg"
                    }`}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {added ? "Added! 🎉" : "Add to Cart"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={!selectedSize}
                    className="flex-1 border-primary text-primary font-display font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    asChild
                  >
                    <Link to="/checkout">Buy Now</Link>
                  </Button>
                </div>
                {selectedSize && (
                  <WhatsAppButton
                    message={buildProductMessage(product.name, selectedSize, product.price)}
                    label="Order via WhatsApp"
                    size="lg"
                    className="w-full"
                  />
                )}
              </div>
            </>
          ) : (
            <NotifyMeForm productId={product.id} />
          )}
        </motion.div>
      </div>

      {/* Story Behind This Piece */}
      {productDrop && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 mb-8"
        >
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">Story Behind This Piece</p>
            <h2 className="font-heading text-2xl text-gold-gradient mb-3">{productDrop.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl">{productDrop.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/drops/${productDrop.slug}`}
                className="inline-block bg-primary text-primary-foreground px-5 py-2 rounded font-display font-bold uppercase tracking-wider text-sm hover:bg-gold-dark transition-colors"
              >
                View Full Drop
              </Link>
              {dropStories.length > 0 && (
                <Link
                  to={`/stories/${dropStories[0].slug}`}
                  className="inline-block border border-primary text-primary px-5 py-2 rounded font-display font-bold uppercase tracking-wider text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Read the Story
                </Link>
              )}
            </div>
          </div>
        </motion.section>
      )}

      <ReviewSection productId={product.id} />

      {completeTheLook.length > 0 && (
        <RelatedCarousel
          subtitle="Complete the look"
          title="Shop the full drop"
          products={completeTheLook as any}
          cta={productDrop ? { label: "View drop", href: `/drops/${productDrop.slug}` } : undefined}
        />
      )}

      {recommended.length > 0 && (
        <RelatedCarousel
          subtitle="You may also like"
          title="More from this category"
          products={recommended as any}
          cta={{ label: "Shop all", href: "/shop" }}
        />
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 py-6 border-t border-border">
        <p className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground">Try it on first?</p>
        <a
          href={`/fitcheck?product=${product.id}`}
          className="inline-flex items-center gap-2 px-5 py-2 rounded bg-primary text-primary-foreground text-xs font-display font-bold uppercase tracking-wider hover:bg-gold-dark transition-colors"
        >
          Open in FitCheck →
        </a>
      </div>
    </div>
  );
}
