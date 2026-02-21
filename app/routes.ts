import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  // =====================
  // Main Public Layout
  // =====================
  layout("components/layout/main-layout.tsx", [
    index("routes/landing-page.tsx"),

    route("/events", "routes/events-page.tsx"),
    route("/events/:slug", "routes/event-slug-page.tsx"),
    route("/events/id/:eventId", "routes/event-detail-page.tsx"),
    route("/organizer/:organizerId", "routes/organizer-profile-page.tsx"),

    route("/checkout", "routes/checkout-page.tsx"),
    route("/payment/:transactionId", "routes/payment-page.tsx"),
    route("/notifications", "routes/notifications-page.tsx"),
    route("/transactions", "routes/transactions-page.tsx"),
  ]),

  // =====================
  // Settings Layout (Customer)
  // =====================
  layout("components/layout/settings-layout.tsx", [
    ...prefix("/settings", [
      index("routes/settings/account-settings.tsx"),
      route("security", "routes/settings/security-settings.tsx"),
      route("notifications", "routes/settings/notification-settings.tsx"),
      route("referrals", "routes/settings/referral-rewards.tsx"),
      route("payments", "routes/settings/payment-settings.tsx"),
    ]),
  ]),

  // =====================
  // Dashboard Layout
  // =====================
  layout("components/layout/dashboard-layout.tsx", [
    ...prefix("/dashboard", [
      index("routes/dashboard/dashboard-page.tsx"),
      route("events", "routes/dashboard/events-page.tsx"),
      route("events/create", "routes/dashboard/create-event-page.tsx"),
      route("events/edit/:eventId", "routes/dashboard/edit-event-page.tsx"),
      route("transactions", "routes/dashboard/transactions-page.tsx"),
      route("attendees", "routes/dashboard/attendees-page.tsx"),
      route("vouchers", "routes/dashboard/vouchers-page.tsx"),
      route("statistics", "routes/dashboard/statistics-page.tsx"),
      route("settings", "routes/dashboard/settings-page.tsx"),
    ]),
  ]),

  // =====================
  // Auth (No Layout)
  // =====================
  route("/login", "routes/auth/login-page.tsx"),
  route("/register", "routes/auth/register-page.tsx"),
  route("/forgot-password", "routes/auth/forgot-password-page.tsx"),
  route("/reset-password", "routes/auth/reset-password-page.tsx"),

  // =====================
  // Check-in (Public, no layout)
  // =====================
  route("/check-in/:token", "routes/check-in-page.tsx"),

  // =====================
  // 404
  // =====================
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
