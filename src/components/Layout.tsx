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

      {/* Header - adjusted for sidebar */}
      <div className="md:ml-52">
        <Header />
      </div>

      {/* Main Content - adjusted for sidebar */}
      <main className="md:ml-52 pt-16 pb-20 md:pb-4">
        <div className="h-full">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;
