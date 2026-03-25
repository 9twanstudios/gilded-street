import { useParams, Link } from "react-router-dom";
import { useBlogPost } from "@/hooks/use-blog";
import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Calendar, ArrowLeft } from "lucide-react";
import { useMemo } from "react";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: allProducts } = useProducts();

  const relatedProducts = useMemo(() => {
    if (!post || !allProducts) return [];
    return allProducts.filter((p) => post.related_product_ids.includes(p.id));
  }, [post, allProducts]);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Post not found.</p>
        <Link to="/blog" className="text-primary hover:underline mt-4 inline-block">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Helmet>
        <title>{post.title} — 9twanfitz Fashion Tips</title>
        <meta name="description" content={post.excerpt || `Read "${post.title}" on the 9twanfitz blog.`} />
        <meta property="og:title" content={`${post.title} — 9twanfitz`} />
        <meta property="og:description" content={post.excerpt || post.title} />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
        <meta property="og:url" content={`https://9twanfitz.vercel.app/blog/${post.slug}`} />
        <link rel="canonical" href={`https://9twanfitz.vercel.app/blog/${post.slug}`} />
      </Helmet>

      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[250px]">{post.title}</span>
      </nav>

      <article className="max-w-3xl mx-auto">
        {post.cover_image && (
          <div className="aspect-video rounded-lg overflow-hidden bg-surface mb-8">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span>By {post.author}</span>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-6">{post.title}</h1>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-display font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-invert prose-gold max-w-none mb-12">
          {/* Render content as paragraphs (simple markdown-like) */}
          {post.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("# ")) {
              return <h2 key={i} className="font-heading text-2xl text-foreground mt-8 mb-4">{paragraph.slice(2)}</h2>;
            }
            if (paragraph.startsWith("## ")) {
              return <h3 key={i} className="font-display font-bold text-xl text-foreground mt-6 mb-3">{paragraph.slice(3)}</h3>;
            }
            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").filter((l) => l.startsWith("- "));
              return (
                <ul key={i} className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                  {items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}
                </ul>
              );
            }
            return <p key={i} className="text-muted-foreground leading-relaxed mb-4">{paragraph}</p>;
          })}
        </div>

        <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline font-display font-semibold text-sm uppercase tracking-wider">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </article>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <ProductGrid products={relatedProducts} title="Shop the Look" />
        </div>
      )}
    </div>
  );
}
