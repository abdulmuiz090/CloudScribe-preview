
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDirectoryPage from "@/pages/admin/AdminDirectoryPage";
import AdminBlogsPage from "@/pages/admin/AdminBlogsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminVideosPage from "@/pages/admin/AdminVideosPage";
import AdminTemplatesPage from "@/pages/admin/AdminTemplatesPage";
import AdminMarketplacePage from "@/pages/admin/AdminMarketplacePage";
import AdminFeedbackPage from "@/pages/admin/AdminFeedbackPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminRequestsPage from "@/pages/admin/AdminRequestsPage";

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="directory" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDirectoryPage />
        </ProtectedRoute>
      } />
      <Route path="blogs" element={
        <ProtectedRoute requiredRole="admin">
          <AdminBlogsPage />
        </ProtectedRoute>
      } />
      <Route path="users" element={
        <ProtectedRoute requiredRole="admin">
          <AdminUsersPage />
        </ProtectedRoute>
      } />
      <Route path="videos" element={
        <ProtectedRoute requiredRole="admin">
          <AdminVideosPage />
        </ProtectedRoute>
      } />
      <Route path="templates" element={
        <ProtectedRoute requiredRole="admin">
          <AdminTemplatesPage />
        </ProtectedRoute>
      } />
      <Route path="marketplace" element={
        <ProtectedRoute requiredRole="admin">
          <AdminMarketplacePage />
        </ProtectedRoute>
      } />
      <Route path="feedback" element={
        <ProtectedRoute requiredRole="admin">
          <AdminFeedbackPage />
        </ProtectedRoute>
      } />
      <Route path="settings" element={
        <ProtectedRoute requiredRole="admin">
          <AdminSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="requests" element={
        <ProtectedRoute requiredRole="admin">
          <AdminRequestsPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
