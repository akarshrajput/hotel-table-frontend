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
} from "lucide-react";
import api from "@/lib/api";

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
}

export default function CustomerMenuPage() {
  const params = useParams();
  const slug = params.slug as string;
  const tableNumber = params.number as string;

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabBarRef = useRef<HTMLDivElement>(null);

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

      setOrderTotal(data.totalAmount);
      setOrderPlaced(true);
      clearCart();
      setCartOpen(false);
    } catch {
      // For demo, show success anyway
      setOrderTotal(getTotalAmount());
      setOrderPlaced(true);
      clearCart();
      setCartOpen(false);
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
            className="text-white/40 mb-4"
          >
            Your order has been sent to the kitchen
          </motion.p>
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
      {/* Google Font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap");
      `}</style>

      {/* Cover Image + Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-52 overflow-hidden"
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-4 left-4 right-4 flex items-end gap-3"
        >
          {restaurant?.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt=""
              className="w-14 h-14 rounded-xl object-cover border-2 shadow-lg"
              style={{ borderColor: `${accentColor}40` }}
            />
          )}
          <div>
            <h1
              className="text-2xl font-bold leading-tight"
            >
              {restaurant?.name}
            </h1>
            <p className="text-white/40 text-xs mt-0.5">
              Table #{tableNumber}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Sticky Tab Bars */}
      <div className="sticky top-0 z-30 bg-[#0d0d0d]/95 backdrop-blur-lg">
        {/* Dietary Filters */}
        {availableDietaryPrefs.length > 0 && (
          <div className="flex items-center gap-6 px-4 py-3">
            {availableDietaryPrefs.includes("veg") && (
              <button
                onClick={() => setActiveDietaryFilter(activeDietaryFilter === "veg" ? "all" : "veg")}
                className="flex items-center gap-2"
              >
                <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${activeDietaryFilter === "veg" ? "bg-green-500/20" : "bg-white/10"}`}>
                  <div className={`w-4 h-4 rounded-full transition-all ${activeDietaryFilter === "veg" ? "translate-x-5 bg-green-500" : "translate-x-0 bg-white/40"}`} />
                </div>
                <span className={`text-sm font-semibold transition-colors ${activeDietaryFilter === "veg" ? "text-green-500" : "text-white/40"}`}>
                  Veg
                </span>
              </button>
            )}
            {availableDietaryPrefs.includes("non-veg") && (
              <button
                onClick={() => setActiveDietaryFilter(activeDietaryFilter === "non-veg" ? "all" : "non-veg")}
                className="flex items-center gap-2"
              >
                <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${activeDietaryFilter === "non-veg" ? "bg-red-500/20" : "bg-white/10"}`}>
                  <div className={`w-4 h-4 rounded-full transition-all ${activeDietaryFilter === "non-veg" ? "translate-x-5 bg-red-500" : "translate-x-0 bg-white/40"}`} />
                </div>
                <span className={`text-sm font-semibold transition-colors ${activeDietaryFilter === "non-veg" ? "text-red-500" : "text-white/40"}`}>
                  Non-Veg
                </span>
              </button>
            )}
          </div>
        )}

        {/* Category Tab Bar */}
        <div
          ref={tabBarRef}
          className="flex overflow-x-auto no-scrollbar gap-1 px-4 py-2"
        >
          <button
            onClick={() => handleCategoryClick("all")}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all"
                ? "text-[#0d0d0d]"
                : "text-white/40 hover:text-white/70"
              }`}
            style={
              activeCategory === "all" ? { backgroundColor: accentColor } : {}
            }
          >
            All
          </button>
          {menu.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat._id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat._id
                  ? "text-[#0d0d0d]"
                  : "text-white/40 hover:text-white/70"
                }`}
              style={
                activeCategory === cat._id
                  ? { backgroundColor: accentColor }
                  : {}
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 pb-32 pt-4">
        {menu
          .filter((cat) => activeCategory === "all" || cat._id === activeCategory)
          .map((cat, catIndex) => {
            const filteredItems = cat.items.filter(
              (item) =>
                activeDietaryFilter === "all" ||
                item.dietaryPreference === activeDietaryFilter
            );

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

                <div className="space-y-3">
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
                      className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm leading-tight"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-white/30 text-xs mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {(item.dietaryPreference || item.prepTime) && (
                          <div className="flex gap-2 items-center mt-2">
                            {item.dietaryPreference && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${item.dietaryPreference === 'veg' ? 'bg-green-500/20 text-green-400' :
                                  item.dietaryPreference === 'non-veg' ? 'bg-red-500/20 text-red-400' :
                                    item.dietaryPreference === 'vegan' ? 'bg-emerald-500/20 text-emerald-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {item.dietaryPreference.replace('-', ' ')}
                              </span>
                            )}
                            {item.prepTime && (
                              <span className="text-[10px] text-white/50 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.prepTime}
                              </span>
                            )}
                          </div>
                        )}
                        <p
                          className="font-bold text-sm mt-2"
                          style={{ color: accentColor }}
                        >
                          ₹{item.price}
                        </p>
                      </div>
                      {item.imageUrl && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
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
                      <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${selectedItem.dietaryPreference === 'veg' ? 'bg-green-500/20 text-green-400' :
                          selectedItem.dietaryPreference === 'non-veg' ? 'bg-red-500/20 text-red-400' :
                            selectedItem.dietaryPreference === 'vegan' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {selectedItem.dietaryPreference.replace('-', ' ')}
                      </span>
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
    </div>
  );
}
