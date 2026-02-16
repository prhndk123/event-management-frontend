import { Link } from "react-router";
import { motion } from "framer-motion";
import { Ticket, Calendar, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { StatusBadge } from "~/components/shared/status-badge";
import { EmptyState } from "~/components/shared/empty-state";
import { formatCurrency, formatDate } from "~/types";
import { useQuery } from "@tanstack/react-query";
import * as transactionService from "~/services/transaction.service";

export default function TransactionsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["my-transactions"],
    queryFn: () => transactionService.getMyTransactions(1, 50),
  });

  const transactions = response?.data ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container-wide">
          <EmptyState
            icon={Ticket}
            title="No transactions yet"
            description="Your ticket purchases will appear here."
            action={{ label: "Browse Events", onClick: () => {} }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container-wide">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Tickets</h1>
        <div className="space-y-4">
          {transactions.map((txn: any, index: number) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              {txn.eventImage && (
                <img
                  src={txn.eventImage}
                  alt={txn.eventTitle}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{txn.eventTitle}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{" "}
                      {formatDate(txn.eventStartDate)}
                    </p>
                    <p className="text-sm text-primary">
                      {txn.ticketTypeName} × {txn.ticketQty}
                    </p>
                  </div>
                  <StatusBadge status={txn.status} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold">
                    {formatCurrency(txn.finalPrice)}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/payment/${txn.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
