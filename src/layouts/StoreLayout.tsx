import { StoreNavbar } from "@/components/store/StoreNavbar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartSidebar } from "@/components/store/CartSidebar";
import { ScrollToTop } from "@/components/store/ScrollToTop";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";

export default function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollToTop />
      <OnboardingBanner />
      <StoreNavbar />
      <CartSidebar />
      <main className="flex-1 pb-16 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <StoreFooter />
      <MobileBottomNav />
    </div>
  );
}
