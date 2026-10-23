import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import './i18n/index.js';
import { supabase } from '@/lib/supabase.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { AppShell } from '@/components/layout/AppShell.jsx';
import { AdminRoute, GuestRoute, ProtectedRoute } from '@/app/guards.jsx';

// Purge any legacy demo or JWT auth session on startup
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('yatraverse-auth');
  } catch {}
}

// Keep app auth in sync with Supabase session state
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    useAuthStore.getState().logout();
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    useAuthStore.getState().logout();
  }
});
import ActivitiesPage from '@/pages/ActivitiesPage.jsx';
import CitiesPage from '@/pages/CitiesPage.jsx';
import CreateTripPage from '@/pages/CreateTripPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import LandingPage from '@/pages/LandingPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import TripBudgetPage from '@/pages/TripBudgetPage.jsx';
import TripBuildPage from '@/pages/TripBuildPage.jsx';
import TripsPage from '@/pages/TripsPage.jsx';
import TripTimelinePage from '@/pages/TripTimelinePage.jsx';
import TripViewPage from '@/pages/TripViewPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import AIAssistantPage from '@/pages/AIAssistantPage.jsx';
import AdminPage from '@/pages/AdminPage.jsx';
import PublicTripPage from '@/pages/PublicTripPage.jsx';

function ProtectedShell() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/s/:slug" element={<PublicTripPage />} />
        <Route element={<ProtectedShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/:id" element={<TripViewPage />} />
          <Route path="/trips/:id/build" element={<TripBuildPage />} />
          <Route path="/trips/:id/timeline" element={<TripTimelinePage />} />
          <Route path="/trips/:id/budget" element={<TripBudgetPage />} />
          <Route path="/cities" element={<CitiesPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/ai" element={<AIAssistantPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);