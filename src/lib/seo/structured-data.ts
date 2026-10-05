// JSON-LD builders for product / drop / article / organization. Stringified
// inside <script type="application/ld+json"> via react-helmet-async or SEO.tsx.

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

export const orgLd = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "ClothingStore"],
  name: "91Fitz",
  url: ORIGIN || "/",
  logo: `${ORIGIN}/og-image.png`,
  address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
  currenciesAccepted: "KES",
  paymentAccepted: "M-Pesa, Card, Bank",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+254769254086",
    contactType: "customer service",
    areaServed: "KE",
    availableLanguage: ["English", "Swahili"],
  },
  sameAs: [
    "https://www.tiktok.com/@91fitz",
    "https://www.instagram.com/sipajuice",
  ],
});

export const productLd = (p: {
  name: string; slug: string; description?: string; image?: string;
  price: number; currency?: string; in_stock?: boolean;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  description: p.description || p.name,
  image: p.image,
  sku: p.slug,
  offers: {
    "@type": "Offer",
    price: p.price,
    priceCurrency: p.currency || "KES",
    availability: p.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    url: `${ORIGIN}/products/${p.slug}`,
  },
});


export const breadcrumbsLd = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url.startsWith("http") ? it.url : `${ORIGIN}${it.url}`,
  })),
});
