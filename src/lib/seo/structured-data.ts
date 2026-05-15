// JSON-LD builders for product / drop / article / organization. Stringified
// inside <script type="application/ld+json"> via react-helmet-async or SEO.tsx.

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

export const orgLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "91Fitz",
  url: ORIGIN || "/",
  logo: `${ORIGIN}/og-image.png`,
  sameAs: [
    "https://www.tiktok.com/@91fitz",
    "https://www.instagram.com/91fitz",
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

export const articleLd = (a: { title: string; slug: string; excerpt?: string; cover?: string; author?: string; published_at?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.excerpt,
  image: a.cover,
  author: { "@type": "Organization", name: a.author || "91Fitz" },
  datePublished: a.published_at,
  mainEntityOfPage: `${ORIGIN}/blog/${a.slug}`,
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
