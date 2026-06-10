import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface Props {
  message?: string;
  onRetry?: () => void;
}

/** Standard error card for failed data fetches — pairs with react-query refetch. */
export function QueryError({ message = "Something went wrong loading this content.", onRetry }: Props) {
  return (
    <div className="text-center py-16 px-4" role="alert">
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-primary text-primary">
          <RefreshCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  );
}

export default QueryError;
