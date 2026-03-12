import { StoreNavbar } from "@/components/store/StoreNavbar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartSidebar } from "@/components/store/CartSidebar";
import { Outlet } from "react-router-dom";

export default function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNavbar />
      <CartSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
    </div>
  );
}
