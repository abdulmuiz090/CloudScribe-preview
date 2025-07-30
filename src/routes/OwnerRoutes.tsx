
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import UserManagementPage from "@/pages/owner/UserManagementPage";
import AdminManagementPage from "@/pages/owner/AdminManagementPage";
import AdminRequestsPage from "@/pages/owner/AdminRequestsPage";
import OwnerBlogsPage from "@/pages/owner/OwnerBlogsPage";
import OwnerTemplatesPage from "@/pages/owner/OwnerTemplatesPage";
import OwnerVideosPage from "@/pages/owner/OwnerVideosPage";
import OwnerMarketplacePage from "@/pages/owner/OwnerMarketplacePage";
import OwnerSettingsPage from "@/pages/owner/OwnerSettingsPage";

export function OwnerRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute requiredRole="super-admin">
          <OwnerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute requiredRole="super-admin">
          <UserManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/admins" element={
        <ProtectedRoute requiredRole="super-admin">
          <AdminManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/requests" element={
        <ProtectedRoute requiredRole="super-admin">
          <AdminRequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/blogs" element={
        <ProtectedRoute requiredRole="super-admin">
          <OwnerBlogsPage />
        </ProtectedRoute>
      } />
      <Route path="/videos" element={
        <ProtectedRoute requiredRole="super-admin">
          <OwnerVideosPage />
        </ProtectedRoute>
      } />
      <Route path="/templates" element={
        <ProtectedRoute requiredRole="super-admin">
          <OwnerTemplatesPage />
        </ProtectedRoute>
      } />
      <Route path="/marketplace" element={
        <ProtectedRoute requiredRole="super-admin">
          <OwnerMarketplacePage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute requiredRole="super-admin">
          <OwnerSettingsPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
