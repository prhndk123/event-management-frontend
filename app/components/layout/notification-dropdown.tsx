import { Link, useNavigate } from "react-router";
import {
  Bell,
  Check,
  CheckCheck,
  Ticket,
  XCircle,
  CreditCard,
  CalendarClock,
  Gift,
  Coins,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  type Notification,
} from "~/services/notification.service";
import { Button } from "~/components/ui/button";

// Icon mapping for notification types
const notificationIcons: Record<string, React.ReactNode> = {
  TRANSACTION_ACCEPTED: <Check className="h-4 w-4 text-green-500" />,
  TRANSACTION_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
  TICKET_CONFIRMATION: <Ticket className="h-4 w-4 text-indigo-500" />,
  PAYMENT_SUCCESS: <CreditCard className="h-4 w-4 text-emerald-500" />,
  NEW_PURCHASE: <ShoppingBag className="h-4 w-4 text-blue-500" />,
  WAITING_APPROVAL: <Clock className="h-4 w-4 text-orange-500" />,
  EVENT_REMINDER: <CalendarClock className="h-4 w-4 text-purple-500" />,
  EVENT_SOLD_OUT: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  PROMOTION: <Gift className="h-4 w-4 text-pink-500" />,
  POINTS_EXPIRING: <Coins className="h-4 w-4 text-yellow-500" />,
  EVENT_UPDATE: <TrendingUp className="h-4 w-4 text-cyan-500" />,
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch unread count with optimized polling
  const { data: unreadData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: notificationService.getUnreadCount,
    staleTime: 1000 * 30, // 30s stale time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 60000, // 60s polling (optional improvement)
  });

  // Fetch notifications when dropdown is open (Unread only)
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications-dropdown"],
    queryFn: () => notificationService.getNotifications(1, 10, false), // Fetch unread only
    enabled: isOpen,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "notifications",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "notifications",
      });
    },
  });

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.data ?? [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    // Navigate
    if (notification.relatedUrl) {
      navigate(notification.relatedUrl);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:scale-105 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-full mt-2 sm:w-96 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <Bell className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors text-left ${!notification.isRead ? "bg-primary/5" : ""
                      }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5 ${!notification.isRead ? "bg-primary/10" : "bg-muted"
                        }`}
                    >
                      {notificationIcons[notification.type] || (
                        <Bell className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-tight ${!notification.isRead
                          ? "font-semibold text-foreground"
                          : "text-foreground/80"
                          }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-primary hover:text-primary/80"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link to="/notifications">View All Notifications</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
