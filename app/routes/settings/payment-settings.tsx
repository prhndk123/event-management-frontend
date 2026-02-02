import { useState, useEffect } from "react";
import { CreditCard, Clock, AlertCircle } from "lucide-react";

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
import { cn } from "~/lib/utils";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getTransactionStatusLabel,
} from "~/types";

// Mock transaction data for customer
const transactions = [
  {
    id: "TRX-2001",
    eventName: "Neon Music Festival 2024",
    ticketQuantity: 2,
    totalPrice: 6000000,
    status: "waiting_payment",
    createdAt: "2026-02-02T21:00:00",
    expiresAt: "2026-02-02T23:00:00", // 2 hours from creation
  },
  {
    id: "TRX-2002",
    eventName: "Tech Startup Summit",
    ticketQuantity: 1,
    totalPrice: 1500000,
    status: "waiting_confirmation",
    createdAt: "2026-02-01T14:30:00",
    expiresAt: null,
  },
  {
    id: "TRX-2003",
    eventName: "Yoga & Wellness Retreat",
    ticketQuantity: 3,
    totalPrice: 1500000,
    status: "done",
    createdAt: "2026-01-28T10:00:00",
    expiresAt: null,
  },
  {
    id: "TRX-2004",
    eventName: "Jazz Night Live",
    ticketQuantity: 1,
    totalPrice: 500000,
    status: "rejected",
    createdAt: "2026-01-25T18:00:00",
    expiresAt: null,
  },
  {
    id: "TRX-2005",
    eventName: "Food Festival 2026",
    ticketQuantity: 4,
    totalPrice: 800000,
    status: "expired",
    createdAt: "2026-01-20T09:00:00",
    expiresAt: null,
  },
  {
    id: "TRX-2006",
    eventName: "Art Exhibition Opening",
    ticketQuantity: 2,
    totalPrice: 400000,
    status: "cancelled",
    createdAt: "2026-01-15T16:30:00",
    expiresAt: null,
  },
];

// Status badge styling
function getStatusBadgeClass(status: string) {
  switch (status) {
    case "done":
      return "bg-green-100 text-green-700 border-green-200";
    case "waiting_payment":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "waiting_confirmation":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    case "expired":
    case "cancelled":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

// Countdown component for payment deadline
function PaymentCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
      setIsUrgent(diff < 30 * 60 * 1000); // Less than 30 minutes
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-mono",
        isUrgent ? "text-red-600" : "text-yellow-600",
      )}
    >
      <Clock className="h-4 w-4" />
      {timeLeft}
    </div>
  );
}

export default function PaymentSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Payment & Transactions
        </h2>
        <p className="text-sm text-muted-foreground">
          View your transaction history and payment details.
        </p>
      </div>

      {/* Payment Info Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Your payment methods and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border-2 border-dashed border-muted-foreground/20">
            <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No payment methods saved.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Payment is done via bank transfer. No sensitive data is stored.
            </p>
            <Button variant="outline" disabled>
              Add Payment Method (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All your ticket purchases and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((trx) => (
                    <TableRow key={trx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{trx.eventName}</p>
                          <p className="text-xs text-muted-foreground">
                            {trx.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {trx.ticketQuantity}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(trx.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-0",
                            getStatusBadgeClass(trx.status),
                          )}
                        >
                          {getTransactionStatusLabel(trx.status as any)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(trx.createdAt)}
                      </TableCell>
                      <TableCell>
                        {trx.status === "waiting_payment" && trx.expiresAt && (
                          <PaymentCountdown expiresAt={trx.expiresAt} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No transactions yet.</p>
              <p className="text-sm text-muted-foreground">
                Your ticket purchases will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
