import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useProductReviews, useSubmitReview, useAverageRating } from "@/hooks/use-reviews";
import { toast } from "sonner";

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              star <= rating ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function StarRatingDisplay({ productId }: { productId: string }) {
  const { data } = useAverageRating(productId);
  if (!data || data.count === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={Math.round(data.avg)} />
      <span className="text-xs text-muted-foreground">({data.count})</span>
    </div>
  );
}

export function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useProductReviews(productId);
  const { data: avgData } = useAverageRating(productId);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to leave a review");
      return;
    }
    submitReview.mutate(
      { productId, rating, comment },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          setComment("");
          setRating(5);
        },
        onError: () => toast.error("Failed to submit review"),
      }
    );
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-heading text-2xl text-foreground">Reviews</h2>
        {avgData && avgData.count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgData.avg)} />
            <span className="text-sm text-muted-foreground">
              {avgData.avg.toFixed(1)} ({avgData.count} review{avgData.count !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {/* Review form */}
      {user && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 mb-6">
          <p className="text-sm font-display font-bold uppercase tracking-wider text-foreground mb-3">Leave a Review</p>
          <StarRating rating={rating} onRate={setRating} interactive />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="mt-3 bg-surface border-border"
            rows={3}
          />
          <Button
            type="submit"
            disabled={submitReview.isPending}
            className="mt-3 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark"
            size="sm"
          >
            {submitReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading reviews...</p>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-display font-semibold text-foreground">
                    {review.profiles?.full_name || "Anonymous"}
                  </span>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
      )}
    </div>
  );
}
