"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import {
  Shield,
  Building2,
  Users,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  ownerId?: { name: string; email: string };
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  restaurantId?: { name: string; slug: string; _id: string };
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "hotels" | "owners"
  >("dashboard");
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalOwners: 0,
    totalOrdersToday: 0,
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Restaurant | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  // Form states
  const [hotelForm, setHotelForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [ownerForm, setOwnerForm] = useState({
    name: "",
    email: "",
    password: "",
    restaurantId: "",
  });

  const router = useRouter();
  const { user, logout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, restaurantsRes, ownersRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/restaurants"),
        api.get("/api/admin/owners"),
      ]);
      setStats(statsRes.data);
      setRestaurants(restaurantsRes.data);
      setOwners(ownersRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        const s = useAuthStore.getState();
        if (!s.isAuthenticated || s.user?.role !== "superadmin") {
          router.push("/admin/login");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    fetchData();
  }, [user, router, fetchData]);

  const handleSaveHotel = async () => {
    try {
      if (editingHotel) {
        await api.put(`/api/admin/restaurants/${editingHotel._id}`, hotelForm);
        toast.success("Restaurant updated");
      } else {
        await api.post("/api/admin/restaurants", hotelForm);
        toast.success("Restaurant created");
      }
      setHotelModalOpen(false);
      setEditingHotel(null);
      setHotelForm({ name: "", slug: "", description: "" });
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteHotel = async (id: string) => {
    if (!confirm("Delete this restaurant and all its data?")) return;
    try {
      await api.delete(`/api/admin/restaurants/${id}`);
      toast.success("Restaurant deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggleActive = async (restaurant: Restaurant) => {
    try {
      await api.put(`/api/admin/restaurants/${restaurant._id}`, {
        isActive: !restaurant.isActive,
      });
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleSaveOwner = async () => {
    try {
      if (editingOwner) {
        await api.put(`/api/admin/owners/${editingOwner._id}`, ownerForm);
        toast.success("Owner updated");
      } else {
        await api.post("/api/admin/owners", ownerForm);
        toast.success("Owner created");
      }
      setOwnerModalOpen(false);
      setEditingOwner(null);
      setOwnerForm({ name: "", email: "", password: "", restaurantId: "" });
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteOwner = async (id: string) => {
    if (!confirm("Delete this owner?")) return;
    try {
      await api.delete(`/api/admin/owners/${id}`);
      toast.success("Owner deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const sidebarItems = [
    { key: "dashboard" as const, label: "Dashboard", icon: Shield },
    { key: "hotels" as const, label: "Restaurants", icon: Building2 },
    { key: "owners" as const, label: "Owners", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">TableQ Admin</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === item.key
                ? "bg-[#10b981]/10 text-[#059669]"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── Dashboard View ──────────────────── */}
          {activeView === "dashboard" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Dashboard
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.totalRestaurants}
                        </p>
                        <p className="text-sm text-gray-400">
                          Total Restaurants
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.totalOwners}
                        </p>
                        <p className="text-sm text-gray-400">Total Owners</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.totalOrdersToday}
                        </p>
                        <p className="text-sm text-gray-400">
                          Orders Today
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ─── Hotels View ─────────────────────── */}
          {activeView === "hotels" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
                <Dialog open={hotelModalOpen} onOpenChange={setHotelModalOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        onClick={() => {
                          setEditingHotel(null);
                          setHotelForm({ name: "", slug: "", description: "" });
                        }}
                        className="bg-[#10b981] hover:bg-[#059669] text-white"
                      />
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Restaurant
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingHotel ? "Edit Restaurant" : "Add Restaurant"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={hotelForm.name}
                          onChange={(e) =>
                            setHotelForm({ ...hotelForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={hotelForm.slug}
                          onChange={(e) =>
                            setHotelForm({ ...hotelForm, slug: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={hotelForm.description}
                          onChange={(e) =>
                            setHotelForm({
                              ...hotelForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button onClick={handleSaveHotel} className="w-full">
                        {editingHotel ? "Update" : "Create"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-100">
                        <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Slug</th>
                          <th className="px-6 py-3">Owner</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Created</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {restaurants.map((r) => (
                          <tr key={r._id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-medium text-sm">
                              {r.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                              {r.slug}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {r.ownerId?.email || "—"}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={r.isActive ? "default" : "secondary"}
                                className={
                                  r.isActive
                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                                    : ""
                                }
                              >
                                {r.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleActive(r)}
                                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                  title={
                                    r.isActive ? "Deactivate" : "Activate"
                                  }
                                >
                                  {r.isActive ? (
                                    <ToggleRight className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingHotel(r);
                                    setHotelForm({
                                      name: r.name,
                                      slug: r.slug,
                                      description: r.description,
                                    });
                                    setHotelModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHotel(r._id)}
                                  className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {restaurants.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-12 text-center text-gray-400 text-sm"
                            >
                              No restaurants yet. Add one to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Owners View ─────────────────────── */}
          {activeView === "owners" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Owners</h1>
                <Dialog open={ownerModalOpen} onOpenChange={setOwnerModalOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        onClick={() => {
                          setEditingOwner(null);
                          setOwnerForm({
                            name: "",
                            email: "",
                            password: "",
                            restaurantId: "",
                          });
                        }}
                        className="bg-[#10b981] hover:bg-[#059669] text-white"
                      />
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Owner
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingOwner ? "Edit Owner" : "Add Owner"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={ownerForm.name}
                          onChange={(e) =>
                            setOwnerForm({
                              ...ownerForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={ownerForm.email}
                          onChange={(e) =>
                            setOwnerForm({
                              ...ownerForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Password{" "}
                          {editingOwner && (
                            <span className="text-gray-400 font-normal">
                              (leave blank to keep current)
                            </span>
                          )}
                        </Label>
                        <Input
                          type="password"
                          value={ownerForm.password}
                          onChange={(e) =>
                            setOwnerForm({
                              ...ownerForm,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Restaurant</Label>
                        <select
                          value={ownerForm.restaurantId}
                          onChange={(e) =>
                            setOwnerForm({
                              ...ownerForm,
                              restaurantId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm"
                        >
                          <option value="">Select restaurant</option>
                          {restaurants.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button onClick={handleSaveOwner} className="w-full">
                        {editingOwner ? "Update" : "Create"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-100">
                        <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Restaurant</th>
                          <th className="px-6 py-3">Created</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {owners.map((o) => (
                          <tr key={o._id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-medium text-sm">
                              {o.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {o.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {o.restaurantId?.name || "—"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingOwner(o);
                                    setOwnerForm({
                                      name: o.name,
                                      email: o.email,
                                      password: "",
                                      restaurantId:
                                        o.restaurantId?._id || "",
                                    });
                                    setOwnerModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOwner(o._id)}
                                  className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {owners.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-12 text-center text-gray-400 text-sm"
                            >
                              No owners yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
