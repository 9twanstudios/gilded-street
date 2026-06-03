import { Link } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { useProfile, useCompleteOnboarding } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";

export function OnboardingBanner() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const complete = useCompleteOnboarding();
  if (!user || !profile || profile.onboarding_completed_at) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/30 px-4 py-2.5">
      <div className="container flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="hidden sm:inline">Finish setting up your profile to unlock referrals and personalized drops.</span>
          <span className="sm:hidden">Finish your profile.</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/onboarding/welcome" className="text-xs font-display font-bold uppercase tracking-wider text-primary hover:underline">Complete now</Link>
          <button onClick={() => complete.mutate()} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
