import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import AdminGuard from "@/components/admin/AdminGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";
import StoreLayout from "@/layouts/StoreLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AttributionCapture from "@/components/AttributionCapture";
import HomePage from "@/pages/store/HomePage";
import NotFound from "./pages/NotFound";

// Store (lazy)
const ProductsPage = lazy(() => import("@/pages/store/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/store/ProductDetailPage"));
const CheckoutPage = lazy(() => import("@/pages/store/CheckoutPage"));
const ProfilePage = lazy(() => import("@/pages/store/ProfilePage"));
const AccountPage = lazy(() => import("@/pages/store/AccountPage"));
const BlogPage = lazy(() => import("@/pages/store/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/store/BlogPostPage"));
const DropsPage = lazy(() => import("@/pages/store/DropsPage"));
const DropDetailPage = lazy(() => import("@/pages/store/DropDetailPage"));
const WalletPage = lazy(() => import("@/pages/store/WalletPage"));
const CreatorStorefront = lazy(() => import("@/pages/store/CreatorStorefront"));
const CreatorDashboard = lazy(() => import("@/pages/store/CreatorDashboard"));
const CreatorsIndexPage = lazy(() => import("@/pages/store/CreatorsIndexPage"));
const StoriesPage = lazy(() => import("@/pages/store/StoriesPage"));
const StoryDetailPage = lazy(() => import("@/pages/store/StoryDetailPage"));
const CartPage = lazy(() => import("@/pages/store/CartPage"));
const QRLandingPage = lazy(() => import("@/pages/store/QRLandingPage"));
const ClusterPage = lazy(() => import("@/pages/store/ClusterPage"));
const LocationPage = lazy(() => import("@/pages/store/LocationPage"));
const ReferralCapturePage = lazy(() => import("@/pages/store/ReferralCapturePage"));
const FitCheckPage = lazy(() => import("@/pages/store/FitCheckPage"));
const FitsGalleryPage = lazy(() => import("@/pages/store/FitsGalleryPage"));
const FitDetailPage = lazy(() => import("@/pages/store/FitDetailPage"));

// Marketing (lazy, named exports)
const AboutPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.ContactPage })));
const ShippingPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.ShippingPage })));
const ReturnsPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.ReturnsPage })));
const PrivacyPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.TermsPage })));
const FaqPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.FaqPage })));
const SizingPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.SizingPage })));
const TrackOrderPage = lazy(() => import("@/pages/store/MarketingPages").then((m) => ({ default: m.TrackOrderPage })));

// Onboarding + auth (lazy)
const OnboardingPage = lazy(() => import("@/pages/onboarding/OnboardingPage"));
const CreatorApplicationPage = lazy(() => import("@/pages/onboarding/CreatorApplicationPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const AdminLoginPage = lazy(() => import("@/pages/auth/AdminLoginPage"));

// Admin (lazy — keeps the entire ACP out of the storefront bundle)
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminDrops = lazy(() => import("@/pages/admin/AdminDrops"));
const AdminBlog = lazy(() => import("@/pages/admin/AdminBlog"));
const AdminStories = lazy(() => import("@/pages/admin/AdminStories"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminWallets = lazy(() => import("@/pages/admin/AdminWallets"));
const AdminLedger = lazy(() => import("@/pages/admin/AdminLedger"));
const AdminWithdrawals = lazy(() => import("@/pages/admin/AdminWithdrawals"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminQR = lazy(() => import("@/pages/admin/AdminQR"));
const AdminSEO = lazy(() => import("@/pages/admin/AdminSEO"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminMarketing = lazy(() => import("@/pages/admin/AdminMarketing"));
const AdminCampaigns = lazy(() => import("@/pages/admin/AdminCampaigns"));
const AdminSegments = lazy(() => import("@/pages/admin/AdminSegments"));
const AdminSeoInsights = lazy(() => import("@/pages/admin/AdminSeoInsights"));
const AdminGrowthSeo = lazy(() => import("@/pages/admin/AdminGrowthSeo"));
const AdminSeoContent = lazy(() => import("@/pages/admin/AdminSeoContent"));
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews"));
const AdminNotifyRequests = lazy(() => import("@/pages/admin/AdminNotifyRequests"));
const AdminCommissions = lazy(() => import("@/pages/admin/AdminCommissions"));
const AdminReferrals = lazy(() => import("@/pages/admin/AdminReferrals"));
const AdminAuditLog = lazy(() => import("@/pages/admin/AdminAuditLog"));
const AdminAutomations = lazy(() => import("@/pages/admin/AdminAutomations"));
const AdminCreatorApplications = lazy(() => import("@/pages/admin/AdminCreatorApplications"));
const AdminIGEmbeds = lazy(() => import("@/pages/admin/AdminIGEmbeds"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          <Sonner />
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <AttributionCapture />
                <Suspense fallback={<PageLoader />}>
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
                    {/* Creators — static segment declared before the dynamic one */}
                    <Route path="/creators" element={<CreatorsIndexPage />} />
                    <Route path="/creator/dashboard" element={<CreatorDashboard />} />
                    <Route path="/creator/:id" element={<CreatorStorefront />} />
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
                    {/* FitCheck */}
                    <Route path="/fitcheck" element={<FitCheckPage />} />
                    <Route path="/fits" element={<FitsGalleryPage />} />
                    <Route path="/fits/:id" element={<FitDetailPage />} />
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
                    <Route path="ig-embeds" element={<AdminIGEmbeds />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
