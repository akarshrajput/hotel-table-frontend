"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  DollarSign,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";

interface Order {
  _id: string;
  tableNumber: number;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: "bg-orange-50 text-orange-700",
  preparing: "bg-amber-50 text-amber-700",
  served: "bg-green-50 text-green-700",
  paid: "bg-blue-50 text-blue-700",
};

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (tableFilter) params.set("tableNumber", tableFilter);
      if (statusFilter && statusFilter !== "all")
        params.set("status", statusFilter);

      params.set("page", String(page));
      params.set("limit", "20");

      const { data } = await api.get(`/api/owner/orders?${params.toString()}`);
      setOrders(data.orders || []);
      setTotalOrders(data.total || 0);
      setTotalRevenue(data.totalRevenue || 0);
      setTotalPages(data.pages || 1);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, tableFilter, statusFilter, page]);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, tableFilter, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalOrders}</p>
              <p className="text-xs text-gray-400">Total Orders</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">From</Label>
              <DatePicker
                date={fromDate ? new Date(fromDate) : undefined}
                setDate={(d) => setFromDate(d ? format(d, "yyyy-MM-dd") : "")}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">To</Label>
              <DatePicker
                date={toDate ? new Date(toDate) : undefined}
                setDate={(d) => setToDate(d ? format(d, "yyyy-MM-dd") : "")}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Table</Label>
              <Input
                type="number"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                placeholder="All"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pb-3 pr-4">Date/Time</TableHead>
                  <TableHead className="pb-3 pr-4">Table</TableHead>
                  <TableHead className="pb-3 pr-4">Items</TableHead>
                  <TableHead className="pb-3 pr-4">Total</TableHead>
                  <TableHead className="pb-3 pr-4">Status</TableHead>
                  <TableHead className="pb-3 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <Fragment key={order._id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order._id ? null : order._id
                        )
                      }
                    >
                      <TableCell className="py-3 pr-4 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}{" "}
                        <span className="text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </TableCell>
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
                      <TableCell className="py-3 text-right flex justify-end">
                        {expandedOrder === order._id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order._id && (
                      <TableRow key={`${order._id}-expanded`} className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableCell colSpan={6} className="py-3">
                          <div className="space-y-1">
                            {order.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="text-gray-400">
                                  ₹{item.price * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-400"
                    >
                      No orders found for the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
              <div className="text-xs text-gray-400">
                Showing {Math.min(totalOrders, (page - 1) * 20 + 1)}–{Math.min(totalOrders, page * 20)} of {totalOrders} orders
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs hover:bg-gray-50 border-gray-200"
                >
                  Previous
                </Button>
                <div className="flex items-center text-xs font-medium px-2 text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 text-xs hover:bg-gray-50 border-gray-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
