import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  notificationService,
  type Notification,
} from "~/services/notification.service";
import { Button } from "~/components/ui/button";
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
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "~/lib/utils";

// Icon mapping for notification types
const notificationIcons: Record<string, React.ReactNode> = {
  TRANSACTION_ACCEPTED: <Check className="h-5 w-5 text-green-500" />,
  TRANSACTION_REJECTED: <XCircle className="h-5 w-5 text-red-500" />,
  TICKET_CONFIRMATION: <Ticket className="h-5 w-5 text-indigo-500" />,
  PAYMENT_SUCCESS: <CreditCard className="h-5 w-5 text-emerald-500" />,
  NEW_PURCHASE: <ShoppingBag className="h-5 w-5 text-blue-500" />,
  WAITING_APPROVAL: <Clock className="h-5 w-5 text-orange-500" />,
  EVENT_REMINDER: <CalendarClock className="h-5 w-5 text-purple-500" />,
  EVENT_SOLD_OUT: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  PROMOTION: <Gift className="h-5 w-5 text-pink-500" />,
  POINTS_EXPIRING: <Coins className="h-5 w-5 text-yellow-500" />,
  EVENT_UPDATE: <TrendingUp className="h-5 w-5 text-cyan-500" />,
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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationService.getNotifications(page, limit),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      // Invalidate notifications query safely using predicate to match all pages
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "notifications",
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "notifications",
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.relatedUrl) {
      navigate(notification.relatedUrl);
    }
  };

  const notifications = data?.data || [];
  const totalPages = data?.meta.totalPages || 1;

  return (
    <div className="container-wide py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your latest activities and alerts.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={markAllAsReadMutation.isPending}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border rounded-xl bg-card animate-pulse"
            >
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/50">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No notifications yet</h3>
            <p className="text-muted-foreground mb-4">
              When you have new notifications, they will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl shadow-sm divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "flex gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/50 justify-between items-start",
                  !notification.isRead
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "",
                )}
              >
                <div className="flex gap-4 items-start w-full">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      !notification.isRead ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    {notificationIcons[notification.type] || (
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <h4
                        className={cn(
                          "text-sm font-medium",
                          !notification.isRead
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm line-clamp-2",
                        !notification.isRead
                          ? "text-foreground/90"
                          : "text-muted-foreground",
                      )}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="shrink-0 pt-2 pl-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm font-medium text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
