"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  Check,
  Loader2,
  ChevronDown,
  Clock,
  Search,
  ClipboardList,
} from "lucide-react";
import api from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  prepTime?: string;
  dietaryPreference?: string;
}

interface MenuCategory {
  _id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

interface RestaurantInfo {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  primaryColor: string;
  rating?: number;
  ratingCount?: number;
  averagePrepTime?: string;
}

// ─── Inline Components ─────────────────────────────────────────

const LiveTimeLeft = ({ placedAt, maxPrepTime }: { placedAt: string, maxPrepTime: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const update = () => {
      if (!maxPrepTime) {
        setTimeLeft("Preparing...");
        return;
      }
      const nums = maxPrepTime.match(/\d+/g);
      if (!nums) {
        setTimeLeft("Preparing...");
        return;
      }
      const maxMins = Math.max(...nums.map(Number));
      const placed = new Date(placedAt).getTime();
      const now = new Date().getTime();
      const elapsedMins = (now - placed) / 60000;
      const remaining = Math.ceil(maxMins - elapsedMins);

      if (remaining <= 0) {
        setTimeLeft("Ready / Served");
      } else {
        setTimeLeft(`${remaining} mins left`);
      }
    };

    update();
    const interval = setInterval(update, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [placedAt, maxPrepTime]);

  return <span className={timeLeft.includes('Ready') ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}>{timeLeft}</span>;
};

export default function CustomerMenuPage() {
  const params = useParams();
  const slug = params.slug as string;
  const tableNumber = params.number as string;

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderMaxPrepTime, setOrderMaxPrepTime] = useState<string | null>(null);

  const [ordersDrawerOpen, setOrdersDrawerOpen] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState<"orders" | "served">("orders");
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabBarRef = useRef<HTMLDivElement>(null);

  // ─── Load Local Orders ────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(`orders_${slug}_${tableNumber}`);
    if (stored) {
      try {
        setMyOrders(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored orders", e);
      }
    }
  }, [slug, tableNumber]);

  // ─── Live Socket Sync for Orders ──────────────────────────────
  useEffect(() => {
    if (!restaurant?._id) return;

    const socket = connectSocket();
    socket.emit("join-restaurant", restaurant._id);

    socket.on("order-updated", ({ orderId, status }: { orderId: string; status: string }) => {
      setMyOrders((prev) => {
        // If order exists in myOrders, update its status
        const hasOrder = prev.some(o => o._id === orderId);
        if (!hasOrder) return prev;

        const updated = prev.map(o =>
          o._id === orderId ? { ...o, status } : o
        );
        localStorage.setItem(`orders_${slug}_${tableNumber}`, JSON.stringify(updated));
        return updated;
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [restaurant?._id, slug, tableNumber]);

  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems,
  } = useCartStore();

  const accentColor =
    restaurant?.primaryColor || "#10b981";

  const availableDietaryPrefs = useMemo(() => {
    const prefs = new Set<string>();
    menu.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.dietaryPreference) {
          prefs.add(item.dietaryPreference);
        }
      });
    });
    return Array.from(prefs);
  }, [menu]);

  const fetchMenu = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/restaurants/${slug}/menu`);
      setRestaurant(data.restaurant);
      setMenu(data.menu);
      if (data.menu.length > 0) {
        setActiveCategory("all");
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    addItem({
      menuItemId: selectedItem._id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: itemQuantity,
      imageUrl: selectedItem.imageUrl,
    });
    setSelectedItem(null);
    setItemQuantity(1);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !restaurant) return;
    setPlacingOrder(true);

    try {
      const { data } = await api.post("/api/orders", {
        restaurantId: restaurant._id,
        tableNumber: parseInt(tableNumber),
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      });

      // Calculate max prep time
      let highestMax = 0;
      let highestPrepString: string | null = null;

      cartItems.forEach((cartItem) => {
        let foundMenuItem = null;
        for (const cat of menu) {
          const item = cat.items.find(i => i._id === cartItem.menuItemId);
          if (item) { foundMenuItem = item; break; }
        }

        if (foundMenuItem && foundMenuItem.prepTime) {
          const nums = foundMenuItem.prepTime.match(/\d+/g);
          if (nums) {
            const localMax = Math.max(...nums.map(n => parseInt(n, 10)));
            if (localMax > highestMax) {
              highestMax = localMax;
              highestPrepString = foundMenuItem.prepTime;
            }
          }
        }
      });

      setOrderMaxPrepTime(highestPrepString);
      setOrderTotal(data.totalAmount);
      setOrderPlaced(true);
      clearCart();
      setCartOpen(false);

      const newOrder = {
        ...data,
        maxPrepTime: highestPrepString,
        placedAt: new Date().toISOString()
      };

      setMyOrders(prev => {
        const updated = [newOrder, ...prev];
        localStorage.setItem(`orders_${slug}_${tableNumber}`, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // For demo, show success anyway (calculate prep time identically)
      let highestMax = 0;
      let highestPrepString: string | null = null;

      cartItems.forEach((cartItem) => {
        let foundMenuItem = null;
        for (const cat of menu) {
          const item = cat.items.find(i => i._id === cartItem.menuItemId);
          if (item) { foundMenuItem = item; break; }
        }
        if (foundMenuItem && foundMenuItem.prepTime) {
          const nums = foundMenuItem.prepTime.match(/\d+/g);
          if (nums) {
            const localMax = Math.max(...nums.map(n => parseInt(n, 10)));
            if (localMax > highestMax) {
              highestMax = localMax;
              highestPrepString = foundMenuItem.prepTime;
            }
          }
        }
      });

      setOrderMaxPrepTime(highestPrepString);
      setOrderTotal(getTotalAmount());
      setOrderPlaced(true);
      clearCart();
      setCartOpen(false);

      const demoOrder = {
        _id: Math.random().toString(36).substring(2, 9),
        items: cartItems.map(ci => {
          let foundMenuItem = null;
          for (const cat of menu) {
            const item = cat.items.find(i => i._id === ci.menuItemId);
            if (item) { foundMenuItem = item; break; }
          }
          return {
            name: foundMenuItem?.name || "Item",
            quantity: ci.quantity,
            price: ci.price
          }
        }),
        totalAmount: getTotalAmount(),
        maxPrepTime: highestPrepString,
        placedAt: new Date().toISOString(),
        status: "new"
      };

      setMyOrders(prev => {
        const updated = [demoOrder, ...prev];
        localStorage.setItem(`orders_${slug}_${tableNumber}`, JSON.stringify(updated));
        return updated;
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  // ─── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-3"
            style={{ color: accentColor }}
          />
          <p className="text-white/40 text-sm">Loading menu...</p>
        </motion.div>
      </div>
    );
  }

  // ─── Order Success State ────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center max-w-sm mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Check className="w-10 h-10" style={{ color: accentColor }} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Order Placed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 mb-6"
          >
            Your order has been sent to the kitchen
          </motion.p>

          {orderMaxPrepTime && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-center gap-2 mx-auto mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full w-max"
            >
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60">
                Prep time: <span className="font-bold text-white">
                  {orderMaxPrepTime.toLowerCase().includes('min') ? orderMaxPrepTime : `${orderMaxPrepTime} mins`}
                </span>
              </span>
            </motion.div>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold mb-8"
            style={{ color: accentColor }}
          >
            ₹{orderTotal.toLocaleString()}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => setOrderPlaced(false)}
            className="px-8 py-3 rounded-xl text-sm font-semibold text-[#0d0d0d]"
            style={{ backgroundColor: accentColor }}
          >
            Order More
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Main Menu ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Global Page Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap");
        body {
          background-color: #0d0d0d !important;
        }
      `}</style>

      {/* Cover Image + Header */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-48 overflow-hidden"
        >
          {restaurant?.coverImageUrl ? (
            <img
              src={restaurant.coverImageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${accentColor}30 0%, #0d0d0d 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Info Card Overlapping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 -mt-16 relative z-10 mb-4"
        >
          <div className="bg-[#1a1a1a] rounded-2xl p-4 shadow-2xl border border-white/5 backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h1 className="text-2xl font-bold text-white mb-1 leading-tight">
                  {restaurant?.name}
                </h1>
                <p className="text-white/60 text-sm mb-2 line-clamp-2">
                  {restaurant?.description || "Experience the best flavors and a wonderful dining atmosphere."}
                </p>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: accentColor }}></span>
                  </span>
                  <p className="text-white/60 text-xs font-medium">
                    Table #{tableNumber}
                  </p>
                </div>
              </div>
              {restaurant?.logoUrl && (
                <div className="w-16 h-16 shrink-0 rounded-2xl p-1 bg-[#1a1a1a] border border-white/10 shadow-xl -mt-8">
                  <img
                    src={restaurant.logoUrl}
                    alt=""
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="bg-green-500/20 text-green-500 p-1 rounded-md">
                  <Check className="w-3 h-3" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold flex items-center gap-1">
                    {restaurant?.rating || 4.2} <span className="text-yellow-500">★</span>
                  </span>
                  <span className="text-white/40 text-[10px]">{restaurant?.ratingCount || 100}+ ratings</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-center gap-1.5">
                <div className="bg-white/5 text-white/60 p-1 rounded-md">
                  <Clock className="w-3 h-3" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold">
                    {restaurant?.averagePrepTime || "15-20"}
                  </span>
                  <span className="text-white/40 text-[10px]">mins prep</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Top Section (Search + Tabs) */}
      <div className="sticky top-0 z-30 bg-[#0d0d0d]/95 backdrop-blur-lg pt-3 pb-1 border-b border-white/5 shadow-sm">

        {/* Search Bar */}
        <div className="px-4 mb-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/40" />
            </div>
            <input
              type="text"
              placeholder="Search for dishes, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 text-white text-sm rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:border-white/20 shadow-lg placeholder:text-white/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-opacity"
              >
                <div className="bg-white/10 p-1 rounded-full">
                  <X className="h-3 w-3 text-white/60" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Dietary Filters & Orders */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 gap-2">
          {availableDietaryPrefs.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1">
              {availableDietaryPrefs.map((pref) => {
                const isActive = activeDietaryFilter === pref;
                let borderColor = "border-green-500";
                let bgColor = "bg-green-500";
                let textColor = "text-green-500";
                let activeBg = "bg-green-500/10";
                let activeBorder = "border-green-500/50";
                let type = "circle";

                if (pref === "non-veg") {
                  borderColor = "border-red-500";
                  bgColor = "bg-red-500";
                  textColor = "text-red-500";
                  activeBg = "bg-red-500/10";
                  activeBorder = "border-red-500/50";
                  type = "triangle";
                } else if (pref === "vegan") {
                  borderColor = "border-emerald-500";
                  bgColor = "bg-emerald-500";
                  textColor = "text-emerald-500";
                  activeBg = "bg-emerald-500/10";
                  activeBorder = "border-emerald-500/50";
                } else if (pref === "egg") {
                  borderColor = "border-yellow-500";
                  bgColor = "bg-yellow-500";
                  textColor = "text-yellow-500";
                  activeBg = "bg-yellow-500/10";
                  activeBorder = "border-yellow-500/50";
                }

                return (
                  <button
                    key={pref}
                    onClick={() => setActiveDietaryFilter(isActive ? "all" : pref)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 ${isActive
                      ? `${activeBg} ${activeBorder}`
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                      }`}
                  >
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${isActive ? borderColor : "border-white/40"}`}>
                      {type === "circle" ? (
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? bgColor : "bg-white/40"}`} />
                      ) : (
                        <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] ${isActive ? "border-b-red-500" : "border-b-white/40"}`} />
                      )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? textColor : "text-white/60"}`}>
                      {pref.replace('-', ' ')}
                    </span>
                    {/* Mini Switch */}
                    <div className={`ml-1 w-6 h-3.5 rounded-full p-[2px] transition-colors ${isActive ? bgColor : "bg-white/20"}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${isActive ? "translate-x-2.5" : "translate-x-0"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1"></div>
          )}

          {/* Orders Button */}
          {myOrders.length > 0 && (
            <button
              onClick={() => {
                setActiveOrderTab("orders");
                setOrdersDrawerOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 bg-[#1a1a1a] border-white/10 hover:bg-white/20 shadow-sm"
            >
              <ClipboardList className="w-4 h-4 text-white/80" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Orders</span>
              {myOrders.filter(o => o.status === "new" || o.status === "preparing").length > 0 && (
                <div className="bg-white/20 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {myOrders.filter(o => o.status === "new" || o.status === "preparing").length}
                </div>
              )}
            </button>
          )}
        </div>

        {/* Category Tab Bar */}
        <div
          ref={tabBarRef}
          className="flex overflow-x-auto no-scrollbar px-4 pt-1 border-b border-white/5"
        >
          <button
            onClick={() => handleCategoryClick("all")}
            className={`shrink-0 px-3 pb-3 pt-2 text-sm transition-all whitespace-nowrap relative ${activeCategory === "all" ? "text-white font-bold" : "text-white/50 font-medium hover:text-white/80"
              }`}
          >
            All
            {activeCategory === "all" && (
              <motion.div
                layoutId="activeCategoryTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
          {menu.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat._id)}
              className={`shrink-0 px-3 pb-3 pt-2 text-sm transition-all whitespace-nowrap relative ${activeCategory === cat._id ? "text-white font-bold" : "text-white/50 font-medium hover:text-white/80"
                }`}
            >
              {cat.name}
              {activeCategory === cat._id && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 pb-32 pt-4">
        {menu
          .filter((cat) => searchQuery !== "" || activeCategory === "all" || cat._id === activeCategory)
          .map((cat, catIndex) => {
            const filteredItems = cat.items.filter((item) => {
              const matchesDiet = activeDietaryFilter === "all" || item.dietaryPreference === activeDietaryFilter;
              const searchLower = searchQuery.toLowerCase();
              const matchesSearch = searchQuery === "" ||
                item.name.toLowerCase().includes(searchLower) ||
                (item.description && item.description.toLowerCase().includes(searchLower));
              return matchesDiet && matchesSearch;
            });

            if (filteredItems.length === 0) return null;

            return (
              <motion.div
                key={cat._id}
                ref={(el) => {
                  categoryRefs.current[cat._id] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
                className="mb-8"
              >
                <h2
                  className="text-lg font-bold mb-4 pl-1"
                  style={{
                    color: accentColor,
                  }}
                >
                  {cat.name}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredItems.map((item, itemIndex) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 + itemIndex * 0.05 }}
                      onClick={() => {
                        setSelectedItem(item);
                        setItemQuantity(1);
                      }}
                      className="flex flex-col p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 active:scale-[0.98] transition-all cursor-pointer relative"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-white/5 relative shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <ShoppingBag className="w-8 h-8 opacity-20" />
                          </div>
                        )}

                        {(item.dietaryPreference) && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1 rounded-md border border-white/10 shadow-sm">
                            <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${item.dietaryPreference === 'veg' ? 'border-green-500' :
                              item.dietaryPreference === 'non-veg' ? 'border-red-500' :
                                item.dietaryPreference === 'vegan' ? 'border-emerald-500' :
                                  'border-yellow-500'
                              }`}>
                              {item.dietaryPreference === 'non-veg' ? (
                                <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-500`} />
                              ) : (
                                <div className={`w-1.5 h-1.5 rounded-full ${item.dietaryPreference === 'veg' ? 'bg-green-500' :
                                  item.dietaryPreference === 'vegan' ? 'bg-emerald-500' :
                                    'bg-yellow-500'
                                  }`} />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col">
                        <h3
                          className="font-semibold text-sm leading-tight line-clamp-2"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-white/30 text-xs mt-1.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <p
                            className="font-bold text-base"
                            style={{ color: accentColor }}
                          >
                            ₹{item.price}
                          </p>
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}

        {menu.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/30">No menu items available right now</p>
          </div>
        )}
      </div>

      {/* ─── Item Bottom Sheet ──────────────────────────────── */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3" />

              {selectedItem.imageUrl && (
                <div className="h-48 mx-4 mt-3 rounded-xl overflow-hidden">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-5">
                <h2
                  className="text-xl font-bold mb-1"
                >
                  {selectedItem.name}
                </h2>
                {selectedItem.description && (
                  <p className="text-white/40 text-sm mb-4">
                    {selectedItem.description}
                  </p>
                )}
                {(selectedItem.dietaryPreference || selectedItem.prepTime) && (
                  <div className="flex gap-3 items-center mb-4">
                    {selectedItem.dietaryPreference && (
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${selectedItem.dietaryPreference === 'veg' ? 'border-green-500' :
                          selectedItem.dietaryPreference === 'non-veg' ? 'border-red-500' :
                            selectedItem.dietaryPreference === 'vegan' ? 'border-emerald-500' :
                              'border-yellow-500'
                          }`}>
                          {selectedItem.dietaryPreference === 'non-veg' ? (
                            <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-500`} />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${selectedItem.dietaryPreference === 'veg' ? 'bg-green-500' :
                              selectedItem.dietaryPreference === 'vegan' ? 'bg-emerald-500' :
                                'bg-yellow-500'
                              }`} />
                          )}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${selectedItem.dietaryPreference === 'veg' ? 'text-green-500' :
                          selectedItem.dietaryPreference === 'non-veg' ? 'text-red-500' :
                            selectedItem.dietaryPreference === 'vegan' ? 'text-emerald-500' :
                              'text-yellow-500'
                          }`}>
                          {selectedItem.dietaryPreference.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                    {selectedItem.prepTime && (
                      <span className="text-xs text-white/50 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {selectedItem.prepTime}
                      </span>
                    )}
                  </div>
                )}
                <p
                  className="text-2xl font-bold mb-6"
                  style={{ color: accentColor }}
                >
                  ₹{selectedItem.price}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button
                    onClick={() =>
                      setItemQuantity(Math.max(1, itemQuantity - 1))
                    }
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">
                    {itemQuantity}
                  </span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 rounded-xl font-semibold text-[#0d0d0d] text-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  Add to Cart — ₹{selectedItem.price * itemQuantity}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Floating Cart Button ───────────────────────────── */}
      {getTotalItems() > 0 && !selectedItem && !cartOpen && (
        <motion.button
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <ShoppingBag className="w-6 h-6 text-[#0d0d0d]" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-[#0d0d0d] text-xs font-bold flex items-center justify-center">
            {getTotalItems()}
          </span>
        </motion.button>
      )}

      {/* ─── Cart Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl max-h-[85vh] flex flex-col"
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3" />

              <div className="p-5 flex items-center justify-between">
                <h2
                  className="text-lg font-bold"
                >
                  Your Cart
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {item.name}
                      </h3>
                      <p
                        className="text-sm font-bold"
                        style={{ color: accentColor }}
                      >
                        ₹{item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.menuItemId,
                            item.quantity - 1
                          )
                        }
                        className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.menuItemId,
                            item.quantity + 1
                          )
                        }
                        className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold shrink-0 w-16 text-right">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/50">Subtotal</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: accentColor }}
                  >
                    ₹{getTotalAmount().toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full py-3.5 rounded-xl font-semibold text-[#0d0d0d] text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: accentColor }}
                >
                  {placingOrder ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hide scrollbar for category tabs */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Orders Drawer */}
      <AnimatePresence>
        {ordersDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
              onClick={() => setOrdersDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 shrink-0" />
              
              <div className="shrink-0 px-5 pt-3 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" style={{ color: accentColor }} />
                    Your Orders
                  </h2>
                  <p className="text-xs text-white/40 mt-1">Track your active and past orders</p>
                </div>
              </div>

              {/* Order Tabs */}
              <div className="flex px-4 border-b border-white/5 shrink-0 gap-2">
                <button
                  onClick={() => setActiveOrderTab("orders")}
                  className={`px-3 pb-3 pt-2 text-sm transition-all whitespace-nowrap relative ${
                    activeOrderTab === "orders" ? "text-white font-bold" : "text-white/50 font-medium hover:text-white/80"
                  }`}
                >
                  Active Orders
                  {activeOrderTab === "orders" && (
                    <motion.div
                      layoutId="activeOrderTabNav"
                      className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                      style={{ backgroundColor: accentColor }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveOrderTab("served")}
                  className={`px-3 pb-3 pt-2 text-sm transition-all whitespace-nowrap relative ${
                    activeOrderTab === "served" ? "text-white font-bold" : "text-white/50 font-medium hover:text-white/80"
                  }`}
                >
                  Served
                  {activeOrderTab === "served" && (
                    <motion.div
                      layoutId="activeOrderTabNav"
                      className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                      style={{ backgroundColor: accentColor }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                {myOrders.filter(order => 
                  activeOrderTab === "orders" 
                    ? (order.status === "new" || order.status === "preparing")
                    : (order.status === "served" || order.status === "paid")
                ).length === 0 ? (
                  <div className="text-center py-10">
                    <ClipboardList className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      {activeOrderTab === "orders" ? "No active orders." : "No served orders yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders
                      .filter(order => 
                        activeOrderTab === "orders" 
                          ? (order.status === "new" || order.status === "preparing")
                          : (order.status === "served" || order.status === "paid")
                      )
                      .map((order, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={order._id || idx}
                        className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/5">
                          <div>
                            <div className="text-xs text-white/40 mb-1">
                              {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/60">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-white/80">
                                <span className="text-white/40 mr-2">{item.quantity}x</span>
                                {item.name}
                              </span>
                              <span className="text-white/60">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                          <span className="text-sm font-medium text-white/60">Total</span>
                          <span className="text-base font-bold" style={{ color: accentColor }}>
                            ₹{order.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
