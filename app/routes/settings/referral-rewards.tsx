import { useState } from "react";
import { Copy, Check, AlertTriangle, Gift, Coins, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/axios";
import { Navigate } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useAuthStore } from "~/modules/auth/auth.store";
import { formatCurrency, formatDate } from "~/types";
import { Skeleton } from "~/components/ui/skeleton";

interface PointHistoryItem {
  id: number;
  amount: number;
  description: string;
  expiredAt: string | null;
  createdAt: string;
  type: string;
  isExpired?: boolean;
}

interface CouponItem {
  id: number;
  code: string;
  discountAmount: number;
  expiredAt: string;
  isExpiringSoon: boolean;
}

interface ReferralData {
  referralCode: string | null;
  totalReferrals: number;
  totalPoints: number;
  pointsHistory: PointHistoryItem[];
  coupons: CouponItem[];
  pointsExpiringSoon: number;
  pointsExpiryDate: string | null;
}

export default function ReferralRewardsPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  // 1. Role Check
  if (user?.role !== "CUSTOMER") {
    // Redirect or show access denied
    return <Navigate to="/dashboard" replace />;
  }

  // 2. Fetch Data
  const { data, isLoading, isError, error } = useQuery<ReferralData>({
    queryKey: ["referral-rewards"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users/referrals");
      return response.data;
    },
    // Only fetch if user is customer (double safety)
    enabled: user?.role === "CUSTOMER",
    retry: false,
  });

  const handleCopyReferral = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied!`);
  };

  // 3. Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // 4. Error State
  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to load rewards data</h3>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Check if any coupons are expiring soon
  const hasExpiringItems = data?.coupons.some((c) => c.isExpiringSoon);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Referral & Rewards
        </h2>
        <p className="text-sm text-muted-foreground">
          Share your referral code and track your rewards.
        </p>
      </div>

      {/* Points Expiration Warning Banner */}
      {/* Points Expiration Warning Banner */}
      {/* Points Expiration Warning Banner */}
      {(data?.pointsExpiringSoon ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Points Expiring Soon!</p>
            <p className="text-sm">
              You have {data?.pointsExpiringSoon.toLocaleString()} points
              expiring on{" "}
              {data?.pointsExpiryDate
                ? formatDate(data.pointsExpiryDate)
                : "soon"}
              . Use them now!
            </p>
          </div>
        </div>
      )}

      {/* Expiration Warning Banner */}
      {hasExpiringItems && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Some of your coupons are expiring soon! Use them before they expire.
          </p>
        </div>
      )}

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends. They get a discount, you earn points!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg bg-muted px-4 py-3">
              <code className="text-lg font-bold tracking-wider">
                {data?.referralCode ?? "N/A"}
              </code>
            </div>
            <Button
              onClick={handleCopyReferral}
              variant="outline"
              size="lg"
              disabled={!data?.referralCode}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Successful Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">
                {data?.totalReferrals ?? 0}
              </span>
              <span className="text-muted-foreground">people</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Point Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              <span className="text-3xl font-bold">
                {data?.totalPoints.toLocaleString() ?? 0}
              </span>
              <span className="text-muted-foreground">pts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
          <CardDescription>
            Track how you earned and used your points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(data?.pointsHistory?.length ?? 0) > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.pointsHistory.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={entry.isExpired ? "opacity-60 grayscale" : ""}
                    >
                      <TableCell className="text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        {entry.description}
                        {entry.isExpired && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                          >
                            Expired
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          entry.type === "USED" || entry.amount < 0
                            ? "text-red-600"
                            : entry.isExpired
                              ? "text-muted-foreground line-through"
                              : "text-green-600"
                        }`}
                      >
                        {entry.amount >= 0 && entry.type !== "USED" ? "+" : ""}
                        {entry.amount.toLocaleString()} pts
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.expiredAt ? (
                          entry.isExpired ? (
                            <span className="text-red-500">
                              Expired on {formatDate(entry.expiredAt)}
                            </span>
                          ) : (
                            formatDate(entry.expiredAt)
                          )
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Coins className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No points history yet.</p>
              <p className="text-sm text-muted-foreground">
                Start referring friends to earn points!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Your Coupons
          </CardTitle>
          <CardDescription>
            Available discount coupons for your next purchase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(data?.coupons?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {data?.coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    coupon.isExpiringSoon
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
                      : ""
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="font-bold">{coupon.code}</code>
                      {coupon.isExpiringSoon && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500 text-yellow-600"
                        >
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Discount: {formatCurrency(coupon.discountAmount)} •
                      Expires: {formatDate(coupon.expiredAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCoupon(coupon.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No coupons available.</p>
              <p className="text-sm text-muted-foreground">
                Keep an eye out for promotions!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
