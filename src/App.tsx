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
import AccountPage from "@/pages/store/AccountPage";
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
import QRLandingPage from "@/pages/store/QRLandingPage";
import ClusterPage from "@/pages/store/ClusterPage";
import LocationPage from "@/pages/store/LocationPage";
import ReferralCapturePage from "@/pages/store/ReferralCapturePage";
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
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminQR from "@/pages/admin/AdminQR";
import AdminSEO from "@/pages/admin/AdminSEO";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminMarketing from "@/pages/admin/AdminMarketing";
import AdminCampaigns from "@/pages/admin/AdminCampaigns";
import AdminSegments from "@/pages/admin/AdminSegments";
import AttributionCapture from "@/components/AttributionCapture";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AttributionCapture />
            <Routes>
              {/* Auth — both legacy and /auth/* paths supported */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/sign-in" element={<LoginPage />} />
              <Route path="/auth/sign-up" element={<SignupPage />} />
              <Route path="/auth/reset" element={<ForgotPasswordPage />} />

              {/* Admin sign-in (public, outside AdminGuard) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/acp/login" element={<AdminLoginPage />} />

              {/* QR landing — standalone (no store layout) */}
              <Route path="/u/:slug" element={<QRLandingPage />} />
              <Route path="/r/:code" element={<ReferralCapturePage />} />

              {/* Store */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ProductsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/drops" element={<DropsPage />} />
                <Route path="/drops/:slug" element={<DropDetailPage />} />
                <Route path="/story" element={<StoriesPage />} />
                <Route path="/story/:slug" element={<StoryDetailPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/stories/:slug" element={<StoryDetailPage />} />
                <Route path="/journal/:slug" element={<BlogPostPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/archive" element={<DropsPage />} />
                <Route path="/c/:cluster" element={<ClusterPage />} />
                <Route path="/l/:location" element={<LocationPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/profile" element={<ProfilePage />} />
                <Route path="/account/orders" element={<AccountPage />} />
                <Route path="/account/wishlist" element={<AccountPage />} />
                <Route path="/account/wallet" element={<WalletPage />} />
                <Route path="/account/qr-history" element={<AccountPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/creator/:id" element={<CreatorStorefront />} />
                <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              </Route>

              {/* Admin (ACP) */}
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="drops" element={<AdminDrops />} />
                <Route path="content" element={<AdminBlog />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="stories" element={<AdminStories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="qr" element={<AdminQR />} />
                <Route path="seo" element={<AdminSEO />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="campaigns" element={<AdminCampaigns />} />
                <Route path="segments" element={<AdminSegments />} />
                <Route path="customers" element={<AdminUsers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="finance" element={<AdminLedger />} />
                <Route path="wallets" element={<AdminWallets />} />
                <Route path="ledger" element={<AdminLedger />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="settings" element={<AdminSettings />} />
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
