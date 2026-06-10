"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuthStore } from "@/store/authStore";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import {
  Loader2,
  Clock,
  CookingPot,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: "new" | "preparing" | "served" | "paid";
  createdAt: string;
}

const columns = [
  { key: "new" as const, label: "New", icon: Clock, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  { key: "preparing" as const, label: "Preparing", icon: CookingPot, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { key: "served" as const, label: "Served / Paid", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function DroppableColumn({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className={className}>{children}</div>;
}

// ─── Shared Card Content (used in both sortable card & drag overlay) ──
function OrderCardContent({ order, className }: { order: Order; className?: string }) {
  return (
    <Card className={`group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${className || ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-300" />
            <span className="font-bold text-lg">#{order.tableNumber}</span>
          </div>
          <span className="text-xs text-gray-400">
            {timeAgo(order.createdAt)}
          </span>
        </div>
        <div className="space-y-1 mb-3">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between text-sm text-gray-600"
            >
              <span className="truncate">
                {item.quantity}x {item.name}
              </span>
              <span className="shrink-0 ml-2 text-gray-400">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="font-bold text-sm">₹{order.totalAmount}</span>
          <Badge
            variant="secondary"
            className={`text-xs ${order.status === "new"
                ? "bg-orange-50 text-orange-600"
                : order.status === "preparing"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-green-50 text-green-600"
              }`}
          >
            {order.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sortable Order Card ───────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: order._id, data: { status: order.status } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // GitLab-style: show a dashed placeholder where the card was
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 opacity-60"
      >
        <div className="invisible">
          <OrderCardContent order={order} />
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCardContent order={order} />
    </div>
  );
}

export default function OrdersKanbanPage() {
  const params = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get("/api/owner/orders");
      // Only show today's active orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = data.filter(
        (o: Order) => new Date(o.createdAt) >= today
      );
      setOrders(todayOrders);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Create audio element for notification
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(
        "data:audio/wav;base64,UklGRlAGAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YSwGAACAgICAgICAf3x5eX19goaJi42OjoyKh4J8d3JvcHJ2e4GHjJCTlJSTkIyHgXt1cG5uc3mAhoyRlZeXlpOPioR+eHJubW9ze4KIjpKWl5aTkY2Ifnl0cG5wdHuAho2SlpiXlZKNiIF8dXFub3N4f4WLkJWYl5WTj4qEfnhzcHBzd32Dh42Sl5mXlpKOiYN9d3Jwb3J3fIKHjZKXmJiUk42JhH54c29vdHl+hImPk5iYlpSSjomDfndycHF0eX+Ei46TmJiWlJCMiIJ9d3JxcnR5foKIjpOXmJaVkI2IhH55c3FxdHl+goiOk5eYl5SSjoqFf3l0cXF0eH2CiI2Tl5eXlJKOioR+eXRxcXR5fYKIjZKXl5iUkY6KhYB7dXFxdHl8goiOk5aXl5SRjYmEf3p1cXFzd32CiI6TlpiWlJGNiYOAfHZycnR4fIOIjZKWl5eUkY2JhX97dXFycnZ7gIWLkJWXl5aSkI2IhH97dnJ0dXl+goiMkZaXl5aTkI2IhH97d3N0d3l/g4iMkZWWlpaTkIyJhX98eHV1d3t+goaMkJOVlpaSj4yIhX99eXZ2eHt/g4aLjpKVlZWSkI2JhoB8eXd3eX2AhIiMj5OVlZWTkI2KhoF9enh3eXx/g4eLj5KVlZSTkY2Kh4J/fHp5eXt+gYSHi4+SlJWUk5GOi4iEgX56eXl7fYCChYmMkJOUlJOSkI2Kh4OAfnx7fH2AgoWIi46RkpOTkpGOjIqHhIGAfn5+f4GCg4aIi42PkZKSkZCOjIqIhYOBgH+AgIGDhIaIio2PkJGRkZCPjYuJh4WDgoGBgYKDhIWHiYqMjY+QkJCQj46NjIqJh4aFhISDhISFhoaHiYqLjI2OjY6NjYyLiomIh4aGhoaGh4eIiImKi4uMjIyMjIyMi4uKioiIh4eHh4eIiImJioqKi4uLi4yMjIuLi4uKiomJiIiHh4iIiImJiYqKiouLi4uLi4uLi4uKioqKiYmJiYmJiYmJiYmKioqKioqKi4uLi4uKi4qKioqKioqJiYmJ"
      );
    }

    // Socket.io connection
    const { user } = useAuthStore.getState();
    if (user?.restaurantId) {
      const socket = connectSocket();
      socket.emit("join-restaurant", user.restaurantId);

      socket.on("new-order", (order: Order) => {
        setOrders((prev) => {
          // Prevent duplicate if the order was already fetched
          if (prev.some((o) => o._id === order._id)) return prev;
          return [order, ...prev];
        });
        audioRef.current?.play().catch(() => { });
        toast.success(`New order from Table #${order.tableNumber}!`);
      });

      socket.on(
        "order-updated",
        ({ orderId, status }: { orderId: string; status: string }) => {
          setOrders((prev) =>
            prev.map((o) =>
              o._id === orderId ? { ...o, status: status as Order["status"] } : o
            )
          );
        }
      );
    }

    return () => {
      disconnectSocket();
    };
  }, [fetchOrders]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id as string;
    const overColumn = over.data?.current?.status || over.id;

    // Determine target status from where it was dropped
    let targetStatus: string | null = null;
    for (const col of columns) {
      if (overColumn === col.key) {
        targetStatus = col.key;
        break;
      }
    }

    // If dropped on another order, get that order's status
    if (!targetStatus) {
      const overOrder = orders.find((o) => o._id === over.id);
      if (overOrder) {
        targetStatus = overOrder.status;
      }
    }

    if (!targetStatus) return;

    const order = orders.find((o) => o._id === orderId);
    if (!order || order.status === targetStatus) return;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? { ...o, status: targetStatus as Order["status"] }
          : o
      )
    );

    try {
      await api.patch(`/api/owner/orders/${orderId}/status`, {
        status: targetStatus,
      });
    } catch {
      fetchOrders();
      toast.error("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  const activeOrder = orders.find((o) => o._id === activeId);

  return (
    <div className="h-[calc(100vh-3.5rem-10rem)] lg:h-[calc(100vh-3.5rem-4rem)] flex flex-col overflow-hidden">


      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {columns.map((col) => {
            const columnOrders = orders.filter((o) =>
              col.key === "served"
                ? o.status === "served" || o.status === "paid"
                : o.status === col.key
            );

            return (
              <div key={col.key} className="flex flex-col min-h-0">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 ${col.bg}`}
                >
                  <col.icon className={`w-4 h-4 ${col.color}`} />
                  <span className={`text-sm font-semibold ${col.color}`}>
                    {col.label}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {columnOrders.length}
                  </Badge>
                </div>

                <SortableContext
                  id={col.key}
                  items={columnOrders.map((o) => o._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={col.key} className="flex-1 min-h-0 overflow-y-auto mt-3 space-y-3 p-1">
                    <AnimatePresence>
                      {columnOrders.map((order) => (
                        <motion.div
                          key={order._id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <OrderCard order={order} />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {columnOrders.length === 0 && (
                      <div className="text-center py-8 text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                        No orders
                      </div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeOrder && (
            <div className="rotate-[2deg] scale-[1.02]" style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.15))" }}>
              <OrderCardContent
                order={activeOrder}
                className="ring-2 ring-blue-400/50 shadow-2xl"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
