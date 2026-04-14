import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import AdminGuard from "@/components/admin/AdminGuard";
import StoreLayout from "@/layouts/StoreLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/store/HomePage";
import ProductsPage from "@/pages/store/ProductsPage";
import ProductDetailPage from "@/pages/store/ProductDetailPage";
import CheckoutPage from "@/pages/store/CheckoutPage";
import ProfilePage from "@/pages/store/ProfilePage";
import BlogPage from "@/pages/store/BlogPage";
import BlogPostPage from "@/pages/store/BlogPostPage";
import DropsPage from "@/pages/store/DropsPage";
import DropDetailPage from "@/pages/store/DropDetailPage";
import WalletPage from "@/pages/store/WalletPage";
import CreatorStorefront from "@/pages/store/CreatorStorefront";
import CreatorDashboard from "@/pages/store/CreatorDashboard";
import StoriesPage from "@/pages/store/StoriesPage";
import StoryDetailPage from "@/pages/store/StoryDetailPage";
import CartPage from "@/pages/store/CartPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminDrops from "@/pages/admin/AdminDrops";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminStories from "@/pages/admin/AdminStories";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminWallets from "@/pages/admin/AdminWallets";
import AdminLedger from "@/pages/admin/AdminLedger";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Store */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/drops" element={<DropsPage />} />
                <Route path="/drops/:slug" element={<DropDetailPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/stories/:slug" element={<StoryDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/account" element={<ProfilePage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/creator/:id" element={<CreatorStorefront />} />
                <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="drops" element={<AdminDrops />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="stories" element={<AdminStories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="wallets" element={<AdminWallets />} />
                <Route path="ledger" element={<AdminLedger />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
