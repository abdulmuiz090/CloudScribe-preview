
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import NotFound from "@/pages/NotFound";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";

function OnboardingRoute() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [user]);

  if (user && showOnboarding) {
    return <OnboardingFlow />;
  }

  return <Index />;
}

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
