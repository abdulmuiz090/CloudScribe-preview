
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/profile/ProfilePage";
import CurrentUserProfilePage from "@/pages/profile/CurrentUserProfilePage";
import PublicProfilePage from "@/pages/profile/PublicProfilePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import PostsPage from "@/pages/posts/PostsPage";
import MarketplacePage from "@/pages/marketplace/MarketplacePage";
import ProductDetailPage from "@/pages/products/ProductDetailPage";
import BlogsPage from "@/pages/blogs/BlogsPage";
import BlogDetailPage from "@/pages/blogs/BlogDetailPage";
import TemplatesPage from "@/pages/templates/TemplatesPage";
import TemplateDetailPage from "@/pages/templates/TemplateDetailPage";
import SpacesPage from "@/pages/spaces/SpacesPage";
import SpaceDetailPage from "@/pages/spaces/SpaceDetailPage";
import CommunitiesPage from "@/pages/communities/CommunitiesPage";
import CommunityDetailPage from "@/pages/communities/CommunityDetailPage";
import FeedsPage from "@/pages/feeds/FeedsPage";
import ChatPage from "@/pages/chat/ChatPage";
import CartPage from "@/pages/cart/CartPage";
import CheckoutSuccessPage from "@/pages/checkout/CheckoutSuccessPage";
import CheckoutCancelPage from "@/pages/checkout/CheckoutCancelPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import WalletPage from "@/pages/wallet/WalletPage";
import SearchPage from "@/pages/search/SearchPage";
import AdvancedSearchPage from "@/pages/search/AdvancedSearchPage";

export function UserRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<CurrentUserProfilePage />} />
        <Route path="/profile/:id" element={<PublicProfilePage />} />
        <Route path="/admin-profile/:id" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:id" element={<BlogDetailPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:id" element={<TemplateDetailPage />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/spaces/:id" element={<SpaceDetailPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/:id" element={<CommunityDetailPage />} />
        <Route path="/feeds" element={<FeedsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/advanced" element={<AdvancedSearchPage />} />
      </Routes>
    </ProtectedRoute>
  );
}
