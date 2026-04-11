import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/store/ProductCard";
import { User } from "lucide-react";

export default function CreatorStorefront() {
  const { id } = useParams<{ id: string }>();

  const { data: profile } = useQuery({
    queryKey: ["creator-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products } = useQuery({
    queryKey: ["creator-products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", id!)
        .eq("approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-gold-gradient">{profile?.full_name || "Creator"}</h1>
          <p className="text-muted-foreground text-sm">Creator Storefront</p>
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any, i: number) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">No products yet</p>
      )}
    </div>
  );
}
