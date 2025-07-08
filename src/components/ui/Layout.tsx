"use client";

import type React from "react";
import { useLocation } from "react-router-dom";

import BottomNavigation from "./BottomNavigation";
import SideNavigation from "./SideNavigation";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  if (isLandingPage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-warm-off-white text-deep-charcoal font-lora">
      {/* Desktop Sidebar Navigation */}
      <SideNavigation />

      {/* Header - responsive positioning */}
      <div className="lg:ml-52">
        <Header />
      </div>

      {/* Main Content - responsive margins and padding */}
      <main className="lg:ml-52 pt-16 pb-20 lg:pb-4 min-h-screen">
        <div className="h-full px-4 sm:px-6 lg:px-0">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;
