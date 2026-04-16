import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/store/ProductCard";
import { SkeletonProductGrid } from "@/components/store/SkeletonProductGrid";
import { EmptyState } from "@/components/store/EmptyState";
import { User, BadgeCheck, ShoppingBag } from "lucide-react";

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

  const { data: creatorData } = useQuery({
    queryKey: ["creator-data", id],
    queryFn: async () => {
      const { data } = await supabase.from("creators").select("*").eq("user_id", id!).maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["creator-products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", id!)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const displayName = creatorData?.brand_name || profile?.full_name || "Creator";

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
          {creatorData?.logo_url ? (
            <img src={creatorData.logo_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-primary" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-4xl text-gold-gradient">{displayName}</h1>
            {creatorData?.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </div>
          {creatorData?.bio && <p className="text-muted-foreground text-sm mt-1">{creatorData.bio}</p>}
          {!creatorData?.bio && <p className="text-muted-foreground text-sm">Creator Storefront</p>}
        </div>
      </div>

      {isLoading ? (
        <SkeletonProductGrid count={4} />
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any, i: number) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No products yet"
          description="This creator hasn't listed any products yet. Check back soon!"
        />
      )}
    </div>
  );
}
