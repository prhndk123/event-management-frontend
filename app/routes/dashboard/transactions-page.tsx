import {
  MoreHorizontal,
  Search,
  Download,
  Filter,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  formatCurrency,
  formatDateTime,
  getTransactionStatusColor,
  getTransactionStatusLabel,
} from "~/types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as transactionService from "~/services/transaction.service";

// Helper to map status colors
function getStatusBadgeClass(statusStr: string) {
  const color = getTransactionStatusColor(statusStr as any);
  switch (color) {
    case "success":
      return "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200";
    case "warning":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200";
    case "info":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200";
    case "destructive":
      return "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200";
  }
}

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["organizer-transactions"],
    queryFn: () => transactionService.getOrganizerTransactions(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => transactionService.confirmTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-transactions"] });
      toast.success("Payment approved successfully.");
      setDetailOpen(false);
    },
    onError: () => toast.error("Failed to approve payment."),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => transactionService.rejectTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-transactions"] });
      toast.error("Payment rejected.");
      setDetailOpen(false);
    },
    onError: () => toast.error("Failed to reject payment."),
  });

  const handleViewDetails = (trx: any) => {
    setSelectedTrx(trx);
    setDetailOpen(true);
  };

  const handleDownloadInvoice = (trxId: string) => {
    toast.success(`Downloading invoice for transaction ${trxId}...`);
  };

  const handleApprove = () => {
    if (!selectedTrx) return;
    approveMutation.mutate(selectedTrx.id);
  };

  const handleReject = () => {
    if (!selectedTrx) return;
    rejectMutation.mutate(selectedTrx.id);
  };

  const filteredTransactions = transactions?.filter(
    (trx: any) =>
      trx.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.id.toString().includes(searchQuery),
  );

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all ticket purchase transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            A list of recent transactions made by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Event & Ticket</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions?.map((trx: any) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      #{trx.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={trx.user.avatar} />
                          <AvatarFallback>
                            {trx.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {trx.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {trx.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {trx.event.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {trx.ticketType.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(trx.finalPrice)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(trx.createdAt)}
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(trx)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadInvoice(trx.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" /> Download
                            Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {trx.status.toLowerCase() ===
                            "waiting_confirmation" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => approveMutation.mutate(trx.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => rejectMutation.mutate(trx.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Review transaction information and payment proof.
            </DialogDescription>
          </DialogHeader>

          {selectedTrx && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Transaction ID
                  </h3>
                  <p className="font-mono">#{selectedTrx.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Customer
                  </h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedTrx.user.avatar} />
                      <AvatarFallback>
                        {selectedTrx.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedTrx.user.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTrx.user.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Event Details
                  </h3>
                  <p className="font-medium">{selectedTrx.event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrx.ticketType.name} × {selectedTrx.ticketQty}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Payment
                  </h3>
                  <div className="flex justify-between items-center py-1">
                    <span>Points Used</span>
                    <span className="font-medium text-success">
                      -{formatCurrency(selectedTrx.pointsUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t mt-1 pt-1">
                    <span>Total Amount</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(selectedTrx.finalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Status</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0",
                        getStatusBadgeClass(selectedTrx.status),
                      )}
                    >
                      {getTransactionStatusLabel(selectedTrx.status as any)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Payment Proof
                </h3>
                <div className="relative aspect-[3/4] w-full bg-muted rounded-lg overflow-hidden border">
                  {selectedTrx.paymentProof ? (
                    <img
                      src={selectedTrx.paymentProof}
                      alt="Payment Proof"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground flex-col gap-2">
                      <FileText className="h-10 w-10 opacity-20" />
                      No Proof Uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleDownloadInvoice(selectedTrx?.id || "")}
            >
              <Download className="mr-2 h-4 w-4" /> Download Invoice
            </Button>

            <div className="flex-1"></div>

            {selectedTrx?.status.toLowerCase() === "waiting_confirmation" ? (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={
                    rejectMutation.isPending || approveMutation.isPending
                  }
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Payment"}
                </Button>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={
                    rejectMutation.isPending || approveMutation.isPending
                  }
                >
                  {approveMutation.isPending
                    ? "Approving..."
                    : "Approve Payment"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
