"use client";

import { Link, Outlet, useLocation, Navigate } from "react-router";
import {
  User,
  Shield,
  Bell,
  Gift,
  CreditCard,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuthStore } from "~/modules/auth/auth.store";

interface SettingsLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  customerOnly?: boolean;
}

const settingsLinks: SettingsLink[] = [
  { href: "/settings", label: "Account", icon: User },
  { href: "/settings/security", label: "Security", icon: Shield },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  {
    href: "/settings/referrals",
    label: "Referral & Rewards",
    icon: Gift,
    customerOnly: true,
  },
  {
    href: "/settings/payments",
    label: "Payments",
    icon: CreditCard,
    customerOnly: true,
  },
];

export default function SettingsLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  const isCustomer = user?.role?.toUpperCase() === "CUSTOMER";

  const filteredLinks = settingsLinks.filter(
    (link) => !link.customerOnly || isCustomer,
  );

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Wait for hydration before checking auth
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-background border-l border-border shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Drawer Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Manage your account preferences
          </p>
          <nav className="space-y-1">
            {filteredLinks.map((link) => {
              const isActive =
                location.pathname === link.href ||
                (link.href !== "/settings" &&
                  location.pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="container-wide py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Back Link - Desktop */}
              <Link
                to="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Link>

              {/* Settings Title */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account preferences
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {filteredLinks.map((link) => {
                  const isActive =
                    location.pathname === link.href ||
                    (link.href !== "/settings" &&
                      location.pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <link.icon className="h-5 w-5 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
