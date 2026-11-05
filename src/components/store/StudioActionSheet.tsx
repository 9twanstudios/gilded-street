import { useNavigate } from "react-router-dom";
import { Camera, PackagePlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** The gold "+" action: create — post a FitCheck look or drop creator merch. */
export function StudioActionSheet({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { user, isCreator } = useAuth();

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  const postLook = () => go(user ? "/fitcheck/post" : "/auth/sign-in?next=/fitcheck/post");
  const dropMerch = () => {
    if (!user) return go("/auth/sign-in?next=/creator/dashboard");
    go(isCreator ? "/creator/dashboard" : "/onboarding/creator");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl border-border bg-background">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display uppercase tracking-widest text-primary">Studio</SheetTitle>
          <SheetDescription>Create on 91 Fitz — wear it, sell it, own it.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 pb-4">
          <button
            type="button"
            onClick={postLook}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
              <Camera className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-base font-semibold uppercase tracking-wider">Post a Look</span>
              <span className="block text-sm text-muted-foreground">Show your fit. Tag the merch. Get discovered.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={dropMerch}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
              <PackagePlus className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-base font-semibold uppercase tracking-wider">Drop Merch</span>
              <span className="block text-sm text-muted-foreground">
                {isCreator ? "Upload your next piece to your storefront." : "Apply as a creator — earn 90% on every sale."}
              </span>
            </span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
