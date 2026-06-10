import { useParams, Link, useNavigate } from "react-router-dom";
import { useFit, useToggleLike } from "@/hooks/use-fits";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Edit3 } from "lucide-react";
import SEO from "@/components/SEO";
import { QueryError } from "@/components/QueryError";
import { toast } from "sonner";

export default function FitDetailPage() {
  const { id } = useParams();
  const { data: fit, isLoading, isError, refetch } = useFit(id);
  const like = useToggleLike(id!);
  const { addItem, setIsOpen } = useCart();
  const navigate = useNavigate();

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground" role="status">Loading…</div>;
  if (isError) return (
    <div className="container py-20">
      <QueryError message="Couldn't load this fit." onRetry={() => refetch()} />
    </div>
  );
  if (!fit) return (
    <div className="container py-20 text-center">
      <p className="text-muted-foreground">Fit not found.</p>
      <Link to="/fits" className="text-primary hover:underline mt-3 inline-block">Back to wall</Link>
    </div>
  );

  const addAll = () => {
    fit.items.forEach((it) => {
      addItem({
        id: it.product_id, name: it.name, price: it.price, image: it.image,
        category: it.slot, description: "", sizes: ["M"], inStock: true,
      } as any, "M");
    });
    toast.success(`Added ${fit.items.length} items to cart`);
    setIsOpen(true);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <SEO
        title={`${fit.name} — FitCheck | 91Fitz`}
        description={`Outfit with ${fit.items.length} pieces. Shop the look.`}
        image={fit.cover_image || undefined}
      />
      <Link to="/fits" className="text-xs text-muted-foreground hover:text-primary mb-4 inline-block">← Back to wall</Link>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface border border-border">
          {fit.cover_image ? <img src={fit.cover_image} alt={fit.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground">No preview</div>}
        </div>
        <div>
          <h1 className="font-heading text-3xl text-gold-gradient mb-2">{fit.name}</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">{fit.model} model · {fit.items.length} pieces</p>

          <div className="flex gap-2 mb-6">
            <Button onClick={() => like.mutate()} variant="outline" className="border-primary text-primary" aria-label={`Like this fit (${fit.likes_count} likes)`}>
              <Heart className="mr-2 h-4 w-4" /> {fit.likes_count}
            </Button>
            <Button onClick={addAll} className="flex-1 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
              <ShoppingBag className="mr-2 h-4 w-4" /> Shop full look
            </Button>
            <Button onClick={() => navigate(`/fitcheck?remix=${fit.id}`)} variant="ghost" aria-label="Remix this fit" title="Remix">
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="font-display font-bold uppercase tracking-wider text-xs text-foreground mb-3">Pieces</h2>
          <ul className="space-y-2">
            {fit.items.map((it, i) => (
              <li key={i}>
                <Link to={`/products/${it.product_id}`} className="flex items-center gap-3 p-2 rounded bg-card border border-border hover:border-primary transition-colors">
                  <img src={it.image} alt={it.name} className="h-12 w-12 rounded object-cover bg-surface" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-foreground truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{it.slot}</p>
                  </div>
                  <p className="text-primary text-sm font-display font-bold">KES {it.price.toLocaleString()}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
