import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  CreditCard,
  Clock,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { formatCurrency, formatDate, getTransactionStatusLabel } from "~/types";
import * as transactionService from "~/services/transaction.service";

// DTO type from API
interface TransactionItem {
  id: number;
  eventTitle: string;
  eventImage: string | null;
  eventStartDate: string;
  ticketTypeName: string;
  ticketQty: number;
  totalPrice: number;
  finalPrice: number;
  status: string;
  createdAt: string;
  expiredAt: string;
}

interface TransactionsResponse {
  data: TransactionItem[];
  meta: {
    page: number;
    take: number;
    total: number;
  };
}

// Status badge styling
function getStatusBadgeClass(status: string) {
  const norm = status.toLowerCase();
  switch (norm) {
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

// Loading skeleton for transaction table
function TransactionTableSkeleton() {
  return (
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
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

export default function PaymentSettingsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<TransactionsResponse>({
    queryKey: ["my-transactions", page],
    queryFn: () => transactionService.getMyTransactions(page, ITEMS_PER_PAGE),
  });

  const transactions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.take) : 1;

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
          {isLoading ? (
            <TransactionTableSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <p className="text-destructive font-medium">
                Failed to load transactions.
              </p>
              <p className="text-sm text-muted-foreground">
                Please try again later.
              </p>
            </div>
          ) : transactions.length > 0 ? (
            <>
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
                            <p className="font-medium">{trx.eventTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {trx.ticketTypeName} • #{trx.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {trx.ticketQty}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(trx.finalPrice)}
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
                          <div className="flex items-center gap-2">
                            {trx.status.toLowerCase() === "waiting_payment" &&
                              trx.expiredAt && (
                                <PaymentCountdown expiresAt={trx.expiredAt} />
                              )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <Link to={`/payment/${trx.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {meta?.page} of {totalPages} ({meta?.total}{" "}
                    transactions)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
