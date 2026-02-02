import { useState } from "react";
import { Copy, Check, AlertTriangle, Gift, Coins, Ticket } from "lucide-react";
import { toast } from "sonner";

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

// Mock data for points history
const pointsHistory = [
  {
    id: "1",
    date: "2026-01-28T10:00:00",
    amount: 10000,
    description: "Referral bonus - John Doe signed up",
    expiresAt: "2026-04-28T10:00:00",
  },
  {
    id: "2",
    date: "2026-01-15T14:30:00",
    amount: 5000,
    description: "First purchase bonus",
    expiresAt: "2026-04-15T14:30:00",
  },
  {
    id: "3",
    date: "2026-01-02T09:00:00",
    amount: -3000,
    description: "Used for ticket purchase",
    expiresAt: null,
  },
];

// Mock data for coupons
const coupons = [
  {
    id: "1",
    code: "WELCOME10",
    discount: 10000,
    expiresAt: "2026-02-05T23:59:59",
    isExpiringSoon: true,
  },
  {
    id: "2",
    code: "REFERRAL20",
    discount: 20000,
    expiresAt: "2026-03-15T23:59:59",
    isExpiringSoon: false,
  },
  {
    id: "3",
    code: "EVENT50K",
    discount: 50000,
    expiresAt: "2026-04-01T23:59:59",
    isExpiringSoon: false,
  },
];

export default function ReferralRewardsPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied!`);
  };

  const totalPoints = user?.point ?? 0;
  const totalReferrals = 5; // Mock data

  // Check if any points or coupons are expiring soon (within 7 days)
  const hasExpiringItems = coupons.some((c) => c.isExpiringSoon);

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
                {user?.referralCode ?? "N/A"}
              </code>
            </div>
            <Button onClick={handleCopyReferral} variant="outline" size="lg">
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
              <span className="text-3xl font-bold">{totalReferrals}</span>
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
                {totalPoints.toLocaleString()}
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
          {pointsHistory.length > 0 ? (
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
                  {pointsHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          entry.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {entry.amount >= 0 ? "+" : ""}
                        {entry.amount.toLocaleString()} pts
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.expiresAt ? formatDate(entry.expiresAt) : "—"}
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
          {coupons.length > 0 ? (
            <div className="space-y-3">
              {coupons.map((coupon) => (
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
                      Discount: {formatCurrency(coupon.discount)} • Expires:{" "}
                      {formatDate(coupon.expiresAt)}
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
