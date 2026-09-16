import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import LandingPage from './pages/landing';
import PricingPage from './pages/pricing';
import PrivacyPage from './pages/privacy';
import AboutPage from './pages/about';
import AIAssistantFoodScanner from './pages/ai-assistant-food-scanner';
import AIChatPage from './pages/ai-assistant-food-scanner/ChatPage';
import FoodScannerPage from './pages/ai-assistant-food-scanner/ScannerPage';
import LoginScreen from './pages/login-screen';
import Dashboard from './pages/dashboard';
import ExerciseWorkoutScreen from './pages/exercise-workout-screen';
import RegisterScreen from './pages/register-screen';
import UserProfile from './pages/user-profile';
import OnboardingScreen from './pages/onboarding';
import ProtectedRoute from './components/ui/ProtectedRoute';
import SchedulePage from './pages/schedule';
import Exercises from './pages/exercise-library';
import AchievementsPage from './pages/achievements';
import PaymentSuccess from './pages/payment-success';
import PaymentCancel from './pages/payment-cancel';
import CommunityPage from './pages/dashboard/CommunityPage';
import MobileAppRouter from './components/mobile/MobileAppRouter';
import MobileLayout from './components/mobile/MobileLayout';
import { useAuth } from './contexts/AuthContext';
import { hasValidSession, getCurrentUser } from './utils/nativeAuth';
import { isNative } from './utils/platform';

/**
 * Auto-routes authenticated users directly to their dashboard (or onboarding if incomplete).
 * Renders LandingPage only if the user is unauthenticated.
 */
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  const valid = hasValidSession();

  if (isAuthenticated || valid) {
    const user = getCurrentUser();
    if (user && user.onboardingCompleted === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080A]">
        <div className="w-10 h-10 border-4 border-[#FAA802] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <LandingPage />;
};

/**
 * Prevents authenticated users from seeing Login or Register screens.
 * If already logged in, redirects directly to Dashboard.
 */
const PublicAuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const valid = hasValidSession();

  if (isAuthenticated || valid) {
    const user = getCurrentUser();
    if (user && user.onboardingCompleted === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Routes = () => {
  const native = isNative();

  const AppContent = () => (
    <RouterRoutes>
      {/* Root route: Auto-redirect authenticated users directly to Dashboard/Onboarding, else Landing */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/ai-assistant-food-scanner" element={<AIAssistantFoodScanner />} />
      <Route path="/ai-chat" element={<AIChatPage />} />
      <Route path="/food-scanner" element={<FoodScannerPage />} />
      <Route path="/login-screen" element={<PublicAuthRoute><LoginScreen /></PublicAuthRoute>} />
      <Route path="/exercise-workout-screen" element={<ExerciseWorkoutScreen />} />
      <Route path="/register-screen" element={<PublicAuthRoute><RegisterScreen /></PublicAuthRoute>} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/community" element={<CommunityPage />} />

      {/* Schedule route removed per request */}
      <Route path="/exercise-library" element={<Exercises />} />
      <Route path="/achievements" element={<AchievementsPage />} />

      {/* Payment flow routes */}
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-cancel" element={<PaymentCancel />} />

      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );

  return (
    <BrowserRouter>
      <SupabaseAuthProvider>
        <AuthProvider>
          <ErrorBoundary>
            <ScrollToTop />
            {native ? (
              <MobileAppRouter>
                <MobileLayout>
                  <AppContent />
                </MobileLayout>
              </MobileAppRouter>
            ) : (
              <MobileLayout>
                <AppContent />
              </MobileLayout>
            )}
          </ErrorBoundary>
        </AuthProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
