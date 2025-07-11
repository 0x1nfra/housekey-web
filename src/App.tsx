import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "./store/auth";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import ShoppingPage from "./pages/ShoppingPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import Layout from "./components/ui/Layout";
import { shallow } from "zustand/shallow";
import { Toaster } from "sonner";
import NotificationSound from "./components/notifications/ui/NotificationSound";
import { ThemeProvider } from "./components/settings/ThemeProvider";
import { withDevCycleProvider } from "@devcycle/react-client-sdk";
import { useVariableValue } from "@devcycle/react-client-sdk";
import MaintenancePage from "./components/ui/MaintenancePage";

function App() {
  const { initializeAuth, initialized } = useAuthStore(
    (state) => ({
      initializeAuth: state.initializeAuth,
      initialized: state.initialized,
    }),
    shallow
  );

  const maintenanceMode = useVariableValue("maintenance-mode", false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            {/* TODO: finish landing page */}
            {/* <Route path="/" element={<LandingPage />} /> */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/onboarding"
              element={
                maintenanceMode ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <OnboardingPage />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  {maintenanceMode ? <MaintenancePage /> : <DashboardPage />}
                  <DashboardPage />
                </Layout>
              }
            />
            <Route
              path="/calendar"
              element={
                <Layout>
                  {maintenanceMode ? <MaintenancePage /> : <CalendarPage />}
                </Layout>
              }
            />
            <Route
              path="/tasks"
              element={
                <Layout>
                  <TasksPage />
                </Layout>
              }
            />
            <Route
              path="/shopping"
              element={
                <Layout>
                  <ShoppingPage />
                </Layout>
              }
            />
            <Route
              path="/notifications"
              element={
                <Layout>
                  <NotificationsPage />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <SettingsPage />
                </Layout>
              }
            />
          </Routes>
        </AnimatePresence>
        <Toaster position="top-right" richColors />
        <NotificationSound />
      </Router>
    </ThemeProvider>
  );
}

// Create the wrapped component with a name
const AppWithDevCycle = withDevCycleProvider({
  sdkKey: import.meta.env.VITE_DVC_CLIENT_DEV,
  user: { isAnonymous: true },
})(App);

// Set a display name for better debugging
AppWithDevCycle.displayName = "AppWithDevCycle";

export default AppWithDevCycle;
