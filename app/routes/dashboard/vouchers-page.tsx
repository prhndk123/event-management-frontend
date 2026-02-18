import { Plus, Search, Tag, Copy, Loader2, Calendar, Ticket } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { formatCurrency, formatDate } from '~/types';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as eventService from '~/services/event.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useForm, type SubmitHandler, type Resolver, Controller } from 'react-hook-form';
import { DatePicker } from '~/components/ui/date-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const voucherSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  code: z.string().min(3, "Code must be at least 3 characters").max(20).toUpperCase(),
  discountAmount: z.coerce.number().min(1, "Discount must be at least 1"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  usageLimit: z.coerce.number().min(1, "Quota must be at least 1"),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"]
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

export default function VouchersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['organizer-vouchers'],
    queryFn: () => eventService.getVouchersByOrganizer(),
  });

  const { data: events } = useQuery({
    queryKey: ['organizer-events-list'],
    queryFn: () => eventService.getOrganizerEvents(),
  });

  const createVoucherMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: number, data: any }) =>
      eventService.createVoucher(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-vouchers'] });
      toast.success('Voucher created successfully');
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create voucher');
    }
  });

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema) as Resolver<VoucherFormValues>,
    defaultValues: {
      discountType: "FIXED",
      usageLimit: 100,
    }
  });

  const onSubmit: SubmitHandler<VoucherFormValues> = (data) => {
    const { eventId, ...voucherData } = data;
    createVoucherMutation.mutate({
      eventId: Number(eventId),
      data: voucherData
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Voucher code copied to clipboard');
  };

  const filteredVouchers = vouchers?.filter((voucher: any) =>
    voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voucher.event?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vouchers & Promos</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for your events.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Voucher
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>All Vouchers</CardTitle>
          <CardDescription>
            List of all discount codes and their performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search vouchers..."
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
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredVouchers && filteredVouchers.length > 0 ? (
                  filteredVouchers.map((voucher: any) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 text-primary px-2 py-1 rounded font-mono font-bold text-sm flex items-center gap-2">
                            <Tag className="h-3 w-3" />
                            {voucher.code}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                            onClick={() => copyToClipboard(voucher.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {voucher.discountType === 'PERCENTAGE'
                          ? `${voucher.discountAmount}%`
                          : formatCurrency(voucher.discountAmount)}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {voucher.event?.title}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {voucher.usedCount} / {voucher.usageLimit}
                        </div>
                        <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(voucher.usedCount / voucher.usageLimit) * 100}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          voucher.isActive && new Date(voucher.endDate) > new Date() ? 'default' : 'secondary'
                        } className="capitalize">
                          {voucher.isActive && new Date(voucher.endDate) > new Date() ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No vouchers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Voucher Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Voucher</DialogTitle>
            <DialogDescription>
              Create a discount code for a specific event.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="eventId">Select Event</Label>
              <Select onValueChange={(val) => setValue("eventId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((event: any) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.eventId && <p className="text-xs text-destructive">{errors.eventId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Voucher Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. SUMMER50"
                  className="uppercase"
                  {...register("code")}
                />
                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Quota</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="100"
                  {...register("usageLimit")}
                />
                {errors.usageLimit && <p className="text-xs text-destructive">{errors.usageLimit.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select defaultValue="FIXED" onValueChange={(val: any) => setValue("discountType", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fixed / Percentage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed Amount (IDR)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountAmount">Discount Value</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  placeholder={watch("discountType") === "PERCENTAGE" ? "10" : "50000"}
                  {...register("discountAmount")}
                />
                {errors.discountAmount && <p className="text-xs text-destructive">{errors.discountAmount.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      setDate={(date) => {
                        if (date) field.onChange(date.toISOString());
                      }}
                      placeholder="Select start date"
                    />
                  )}
                />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      setDate={(date) => {
                        if (date) field.onChange(date.toISOString());
                      }}
                      placeholder="Select end date"
                    />
                  )}
                />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createVoucherMutation.isPending}>
                {createVoucherMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Voucher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
