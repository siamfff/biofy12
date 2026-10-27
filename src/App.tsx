import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './hooks/useToast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { SupportChat } from './components/support/SupportChat';

/* PUBLIC */
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SetupUsername from './pages/auth/SetupUsername';
import NotFound from './pages/public/NotFound';
import ProfileView from './pages/public/ProfileView';
import Leaderboard from './pages/public/Leaderboard';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';

/* USER PANEL */
import Dashboard from './pages/dashboard/Dashboard';
import Customize from './pages/dashboard/Customize';
import Links from './pages/dashboard/Links';
import Badges from './pages/dashboard/Badges';
import Verification from './pages/dashboard/Verification';
import Premium from './pages/dashboard/Premium';
import RedeemCode from './pages/dashboard/RedeemCode';
import Analytics from './pages/dashboard/Analytics';
import Notifications from './pages/dashboard/Notifications';
import Settings from './pages/dashboard/Settings';

/* ADMIN PANEL */
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminBadges from './pages/admin/AdminBadges';
import AdminVerification from './pages/admin/AdminVerification';
import AdminPremium from './pages/admin/AdminPremium';
import AdminRedeem from './pages/admin/AdminRedeem';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminModeration from './pages/admin/AdminModeration';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ==================================================
                PUBLIC ROUTES
                ================================================== */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/setup-username" element={<SetupUsername />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* ==================================================
                USER PANEL
                ================================================== */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="customize" element={<Customize />} />

              {/* Legacy redirects */}
              <Route path="profile" element={<Navigate to="/dashboard/customize" replace />} />
              <Route path="appearance" element={<Navigate to="/dashboard/customize" replace />} />
              <Route path="music" element={<Navigate to="/dashboard/customize" replace />} />
              <Route path="socials" element={<Navigate to="/dashboard/customize" replace />} />
              <Route path="widgets" element={<Navigate to="/dashboard/customize" replace />} />

              <Route path="links" element={<Links />} />
              <Route path="badges" element={<Badges />} />
              <Route path="verification" element={<Verification />} />
              <Route path="premium" element={<Premium />} />
              <Route path="redeem" element={<RedeemCode />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ==================================================
                ADMIN PANEL
                ================================================== */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:uid" element={<AdminUserDetail />} />
              <Route path="badges" element={<AdminBadges />} />
              <Route path="verification" element={<AdminVerification />} />
              <Route path="premium" element={<AdminPremium />} />
              <Route path="redeem" element={<AdminRedeem />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>

            {/* ==================================================
                DYNAMIC + 404
                ================================================== */}
            <Route path="/u/:username" element={<ProfileView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* ==================================================
              AI SUPPORT CHAT — Global floating widget
              Appears on every page
              ================================================== */}
          <SupportChat />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}