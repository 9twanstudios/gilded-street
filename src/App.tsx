import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import AdminGuard from "@/components/admin/AdminGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import CreatorsIndexPage from "@/pages/store/CreatorsIndexPage";
import StoriesPage from "@/pages/store/StoriesPage";
import StoryDetailPage from "@/pages/store/StoryDetailPage";
import CartPage from "@/pages/store/CartPage";
import QRLandingPage from "@/pages/store/QRLandingPage";
import ClusterPage from "@/pages/store/ClusterPage";
import LocationPage from "@/pages/store/LocationPage";
import ReferralCapturePage from "@/pages/store/ReferralCapturePage";
import { AboutPage, ContactPage, ShippingPage, ReturnsPage, PrivacyPage, TermsPage, FaqPage, SizingPage, TrackOrderPage } from "@/pages/store/MarketingPages";
import OnboardingPage from "@/pages/onboarding/OnboardingPage";
import CreatorApplicationPage from "@/pages/onboarding/CreatorApplicationPage";
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
import AdminSeoInsights from "@/pages/admin/AdminSeoInsights";
import AdminGrowthSeo from "@/pages/admin/AdminGrowthSeo";
import AdminSeoContent from "@/pages/admin/AdminSeoContent";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminNotifyRequests from "@/pages/admin/AdminNotifyRequests";
import AdminCommissions from "@/pages/admin/AdminCommissions";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminAuditLog from "@/pages/admin/AdminAuditLog";
import AdminAutomations from "@/pages/admin/AdminAutomations";
import AdminCreatorApplications from "@/pages/admin/AdminCreatorApplications";
import AttributionCapture from "@/components/AttributionCapture";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Sonner />
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <AttributionCapture />
                <Routes>
                  {/* Auth — canonical /auth/* + legacy redirects */}
                  <Route path="/auth/sign-in" element={<LoginPage />} />
                  <Route path="/auth/sign-up" element={<SignupPage />} />
                  <Route path="/auth/reset" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
                  <Route path="/signup" element={<Navigate to="/auth/sign-up" replace />} />
                  <Route path="/forgot-password" element={<Navigate to="/auth/reset" replace />} />

                  {/* Admin sign-in (public, outside AdminGuard) */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/acp/login" element={<AdminLoginPage />} />

                  {/* QR + referral landing */}
                  <Route path="/u/:slug" element={<QRLandingPage />} />
                  <Route path="/r/:code" element={<ReferralCapturePage />} />

                  {/* Onboarding */}
                  <Route path="/onboarding/welcome" element={<OnboardingPage />} />
                  <Route path="/onboarding/creator" element={<CreatorApplicationPage />} />

                  {/* Store */}
                  <Route element={<StoreLayout />}>
                    <Route path="/" element={<HomePage />} />
                    {/* Canonical: /shop */}
                    <Route path="/shop" element={<ProductsPage />} />
                    <Route path="/products" element={<Navigate to="/shop" replace />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/drops" element={<DropsPage />} />
                    <Route path="/drops/:slug" element={<DropDetailPage />} />
                    {/* Canonical: /stories */}
                    <Route path="/stories" element={<StoriesPage />} />
                    <Route path="/stories/:slug" element={<StoryDetailPage />} />
                    <Route path="/story" element={<Navigate to="/stories" replace />} />
                    <Route path="/story/:slug" element={<StoryDetailPage />} />
                    {/* Canonical: /blog */}
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/journal/:slug" element={<BlogPostPage />} />
                    <Route path="/archive" element={<DropsPage />} />
                    <Route path="/c/:cluster" element={<ClusterPage />} />
                    <Route path="/l/:location" element={<LocationPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    {/* Canonical account routes */}
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/account/profile" element={<ProfilePage />} />
                    <Route path="/account/orders" element={<AccountPage />} />
                    <Route path="/account/wishlist" element={<AccountPage />} />
                    <Route path="/account/wallet" element={<WalletPage />} />
                    <Route path="/account/qr-history" element={<AccountPage />} />
                    <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
                    <Route path="/wallet" element={<Navigate to="/account/wallet" replace />} />
                    {/* Creators */}
                    <Route path="/creators" element={<CreatorsIndexPage />} />
                    <Route path="/creator/:id" element={<CreatorStorefront />} />
                    <Route path="/creator/dashboard" element={<CreatorDashboard />} />
                    {/* Marketing */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/shipping" element={<ShippingPage />} />
                    <Route path="/returns" element={<ReturnsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/sizing" element={<SizingPage />} />
                    <Route path="/track-order" element={<TrackOrderPage />} />
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
                    <Route path="seo-insights" element={<AdminSeoInsights />} />
                    <Route path="growth-seo" element={<AdminGrowthSeo />} />
                    <Route path="seo-content" element={<AdminSeoContent />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="marketing" element={<AdminMarketing />} />
                    <Route path="campaigns" element={<AdminCampaigns />} />
                    <Route path="segments" element={<AdminSegments />} />
                    <Route path="customers" element={<AdminUsers />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="notify-requests" element={<AdminNotifyRequests />} />
                    <Route path="finance" element={<AdminLedger />} />
                    <Route path="wallets" element={<AdminWallets />} />
                    <Route path="ledger" element={<AdminLedger />} />
                    <Route path="withdrawals" element={<AdminWithdrawals />} />
                    <Route path="commissions" element={<AdminCommissions />} />
                    <Route path="referrals" element={<AdminReferrals />} />
                    <Route path="creator-applications" element={<AdminCreatorApplications />} />
                    <Route path="audit-log" element={<AdminAuditLog />} />
                    <Route path="automations" element={<AdminAutomations />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
