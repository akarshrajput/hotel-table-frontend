"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  DollarSign,
  TableProperties,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  availableTables: number;
  menuItemsCount: number;
  recentOrders: Array<{
    _id: string;
    tableNumber: number;
    items: Array<{ name: string; quantity: number }>;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

const statusColors: Record<string, string> = {
  new: "bg-orange-50 text-orange-700",
  preparing: "bg-amber-50 text-amber-700",
  served: "bg-green-50 text-green-700",
  paid: "bg-blue-50 text-blue-700",
};

export default function OwnerDashboardPage() {
  const params = useParams();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/api/owner/orders/stats");
      setStats(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  const metrics = [
    {
      label: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "Today's Revenue",
      value: `₹${(stats?.todayRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-500",
    },
    {
      label: "Available Tables",
      value: stats?.availableTables || 0,
      icon: TableProperties,
      color: "bg-purple-50 text-purple-500",
    },
    {
      label: "Menu Items",
      value: stats?.menuItemsCount || 0,
      icon: UtensilsCrossed,
      color: "bg-amber-50 text-amber-500",
    },
  ];

  return (
    <div>


      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${m.color}`}
                  >
                    <m.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-xs text-gray-400">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pb-3 pr-4">Table</TableHead>
                  <TableHead className="pb-3 pr-4">Items</TableHead>
                  <TableHead className="pb-3 pr-4">Total</TableHead>
                  <TableHead className="pb-3 pr-4">Status</TableHead>
                  <TableHead className="pb-3 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentOrders?.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="py-3 pr-4 font-semibold text-sm">
                      #{order.tableNumber}
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-sm text-gray-500 font-normal">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-sm font-medium">
                      ₹{order.totalAmount}
                    </TableCell>
                    <TableCell className="py-3 pr-4">
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status] || ""}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-400 text-right">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-gray-400 text-sm"
                    >
                      No orders yet. Share your QR codes to start receiving
                      orders!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
