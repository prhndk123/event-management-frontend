import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency } from "~/types";
import { useQuery } from "@tanstack/react-query";
import * as dashboardService from "~/services/dashboard.service";
import { DateRangePicker } from "~/components/shared/date-range-picker";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SummaryData {
  totalEvents: number;
  totalRevenue: number;
  totalTransactions: number;
  pendingConfirmations: number;
  revenueChart: { name: string; revenue: number; tickets: number }[];
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 5);
    from.setDate(1);
    return { from, to };
  });

  const {
    data: summary,
    isLoading,
    isError,
  } = useQuery<SummaryData>({
    queryKey: [
      "dashboard-summary",
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
    ],
    queryFn: () =>
      dashboardService.getSummary(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
      ),
  });

  const stats = summary
    ? [
        {
          title: "Total Events",
          value: summary.totalEvents,
          icon: Calendar,
          color: "text-primary",
        },
        {
          title: "Total Revenue",
          value: formatCurrency(summary.totalRevenue),
          icon: DollarSign,
          color: "text-success",
        },
        {
          title: "Transactions",
          value: summary.totalTransactions,
          icon: CreditCard,
          color: "text-info",
        },
        {
          title: "Pending",
          value: summary.pendingConfirmations,
          icon: Users,
          color: "text-warning",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={setDateRange}
          className="w-full sm:w-auto"
        />
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : isError ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive/50 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Failed to load chart data.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.revenueChart ?? []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}M`
                        : v >= 1000
                          ? `${(v / 1000).toFixed(0)}K`
                          : `${v}`
                    }
                  />
                  <Tooltip
                    formatter={(v) =>
                      formatCurrency((v as number | undefined) ?? 0)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
