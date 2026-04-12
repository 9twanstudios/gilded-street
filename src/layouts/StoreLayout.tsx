import { StoreNavbar } from "@/components/store/StoreNavbar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartSidebar } from "@/components/store/CartSidebar";
import { ScrollToTop } from "@/components/store/ScrollToTop";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";
import { Outlet } from "react-router-dom";

export default function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollToTop />
      <StoreNavbar />
      <CartSidebar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <StoreFooter />
      <MobileBottomNav />
    </div>
  );
}
