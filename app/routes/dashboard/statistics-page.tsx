import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatCurrency } from "~/types";
import { Download, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import * as dashboardService from "~/services/dashboard.service";
import { DateRangePicker } from "~/components/shared/date-range-picker";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

interface AnalyticsData {
  monthlyRevenue: { name: string; revenue: number; tickets: number }[];
  categoryDistribution: { name: string; value: number }[];
  topEvents: { name: string; tickets: number }[];
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full" />;
}

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    from.setDate(1);
    return { from, to };
  });

  const {
    data: analytics,
    isLoading,
    isError,
  } = useQuery<AnalyticsData>({
    queryKey: [
      "dashboard-analytics",
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
    ],
    queryFn: () =>
      dashboardService.getAnalytics(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
      ),
  });

  const monthlyRevenue = analytics?.monthlyRevenue ?? [];
  const categoryDistribution = analytics?.categoryDistribution ?? [];
  const topEvents = analytics?.topEvents ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Statistics & Analytics
          </h1>
          <p className="text-muted-foreground">
            Visualize your event performance and revenue data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={setDateRange}
            className="w-full sm:w-auto"
          />
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <p className="text-destructive font-medium">
                Failed to load analytics data.
              </p>
              <p className="text-sm text-muted-foreground">
                Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue performance for the selected date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyRevenue}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis
                        tickFormatter={(value) =>
                          value >= 1000000
                            ? `Rp${(value / 1000000).toFixed(1)}M`
                            : value >= 1000
                              ? `Rp${(value / 1000).toFixed(0)}K`
                              : `Rp${value}`
                        }
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Sales by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Sales by Category</CardTitle>
              <CardDescription>
                Distribution of ticket sales across event categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : categoryDistribution.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No category data available yet.
                </div>
              ) : (
                <div className="h-[300px] w-full flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryDistribution.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Events */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
              <CardDescription>
                Events with the highest ticket sales volume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : topEvents.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No event data available yet.
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topEvents}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar
                        dataKey="tickets"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
