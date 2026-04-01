import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsWishlisted, useToggleWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, className = "", size = "md" }: WishlistButtonProps) {
  const { user } = useAuth();
  const { data: isWishlisted } = useIsWishlisted(productId);
  const toggle = useToggleWishlist();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to save items to your wishlist");
      return;
    }
    toggle.mutate(productId, {
      onSuccess: (result) => {
        toast.success(result.added ? "Added to wishlist" : "Removed from wishlist");
      },
    });
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-200 ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`${iconSize} transition-all duration-200 ${
          isWishlisted
            ? "fill-primary text-primary"
            : "text-muted-foreground hover:text-primary"
        }`}
      />
    </button>
  );
}
