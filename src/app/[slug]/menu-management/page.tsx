"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  ImageIcon,
  Clock,
  UtensilsCrossed,
  Search,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  sortOrder: number;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  availableFrom: string | null;
  availableTo: string | null;
  categoryId: string;
  prepTime?: string;
  dietaryPreference?: string;
}

// ─── Sortable Category Item ────────────────────────────────────
function SortableCategory({
  category,
  isSelected,
  itemCount,
  onClick,
  onDelete,
  onRename,
}: {
  category: Category;
  isSelected: boolean;
  itemCount: number;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newName: string) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category._id });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [loading, setLoading] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!editName.trim() || editName.trim() === category.name) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onRename(editName.trim());
      setIsEditing(false);
    } catch {
      toast.error("Failed to rename category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-[#10b981]/10 text-[#059669] border border-[#10b981]/30 shadow-sm"
          : "hover:bg-gray-50 border border-transparent"
      }`}
      onClick={onClick}
    >
      <Button
        variant="ghost"
        size="icon"
        {...attributes}
        {...listeners}
        className="h-6 w-6 cursor-grab text-gray-300 hover:text-gray-500 shrink-0 hover:bg-transparent"
        onClick={(e) => e.stopPropagation()}
        disabled={isEditing}
      >
        <GripVertical className="w-4 h-4" />
      </Button>

      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-7 text-xs px-2 py-1 font-medium bg-white border-gray-300 flex-1"
          autoFocus
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave(e);
            if (e.key === "Escape") {
              e.stopPropagation();
              setEditName(category.name);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <span className="flex-1 text-sm font-medium truncate">
          {category.name}
        </span>
      )}

      {!isEditing && (
        <>
          <span className="text-xs text-gray-400 shrink-0 tabular-nums">
            {itemCount}
          </span>
          {isSelected && (
            <ChevronRight className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          )}
          <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="h-6 w-6 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-6 w-6 hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [allItemCounts, setAllItemCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Item form
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
    hasTimeRestriction: false,
    availableFrom: "",
    availableTo: "",
    prepTime: "",
    dietaryPreference: "",
  });
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/api/owner/menu/categories");
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]._id);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchItems = useCallback(async () => {
    if (!selectedCategory) return;
    try {
      const { data } = await api.get(
        `/api/owner/menu/items?categoryId=${selectedCategory}`
      );
      setItems(data);
    } catch {
      toast.error("Failed to load items");
    }
  }, [selectedCategory]);

  // Fetch item counts for all categories
  const fetchAllItemCounts = useCallback(async () => {
    try {
      const counts: Record<string, number> = {};
      for (const cat of categories) {
        try {
          const { data } = await api.get(
            `/api/owner/menu/items?categoryId=${cat._id}`
          );
          counts[cat._id] = data.length;
        } catch {
          counts[cat._id] = 0;
        }
      }
      setAllItemCounts(counts);
    } catch {
      // silently fail
    }
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchAllItemCounts();
    }
  }, [categories, fetchAllItemCounts]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await api.post("/api/owner/menu/categories", { name: newCategoryName });
      setNewCategoryName("");
      setAddingCategory(false);
      fetchCategories();
      toast.success("Category added");
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Items must be removed first.")) return;
    try {
      await api.delete(`/api/owner/menu/categories/${id}`);
      if (selectedCategory === id) setSelectedCategory(null);
      fetchCategories();
      toast.success("Category deleted");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    try {
      await api.put(`/api/owner/menu/categories/${id}`, { name: newName });
      toast.success("Category renamed");
      fetchCategories();
    } catch {
      toast.error("Failed to rename category");
      throw new Error("Rename failed");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c._id === active.id);
    const newIndex = categories.findIndex((c) => c._id === over.id);
    const newOrder = arrayMove(categories, oldIndex, newIndex);
    setCategories(newOrder);

    try {
      await api.put("/api/owner/menu/categories/reorder", {
        orderedIds: newOrder.map((c) => c._id),
      });
    } catch {
      fetchCategories();
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await api.patch(`/api/owner/menu/items/${item._id}/toggle`);
      fetchItems();
    } catch {
      toast.error("Toggle failed");
    }
  };

  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name: "",
      description: "",
      price: "",
      isAvailable: true,
      hasTimeRestriction: false,
      availableFrom: "",
      availableTo: "",
      prepTime: "",
      dietaryPreference: "",
    });
    setItemImage(null);
    setItemModalOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      isAvailable: item.isAvailable,
      hasTimeRestriction: !!(item.availableFrom || item.availableTo),
      availableFrom: item.availableFrom || "",
      availableTo: item.availableTo || "",
      prepTime: item.prepTime || "",
      dietaryPreference: item.dietaryPreference || "",
    });
    setItemImage(null);
    setItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.name || !itemForm.price || !selectedCategory) return;
    setSavingItem(true);

    try {
      const formData = new FormData();
      formData.append("name", itemForm.name);
      formData.append("description", itemForm.description);
      formData.append("price", itemForm.price);
      formData.append("categoryId", selectedCategory);
      formData.append("isAvailable", String(itemForm.isAvailable));
      if (itemForm.hasTimeRestriction) {
        formData.append("availableFrom", itemForm.availableFrom);
        formData.append("availableTo", itemForm.availableTo);
      }
      formData.append("prepTime", itemForm.prepTime);
      formData.append("dietaryPreference", itemForm.dietaryPreference);
      if (itemImage) {
        formData.append("image", itemImage);
      }

      if (editingItem) {
        await api.put(`/api/owner/menu/items/${editingItem._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item updated");
      } else {
        await api.post("/api/owner/menu/items", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item added");
      }

      setItemModalOpen(false);
      fetchItems();
      fetchAllItemCounts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Save failed");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      await api.delete(`/api/owner/menu/items/${id}`);
      toast.success("Item deleted");
      fetchItems();
      fetchAllItemCounts();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  const selectedCategoryName =
    categories.find((c) => c._id === selectedCategory)?.name || "Select a category";

  return (
    <div className="h-[calc(100vh-3.5rem-2rem)] lg:h-[calc(100vh-3.5rem-4rem)] flex flex-col overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* ─── Left Panel: Categories ─────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 m-1">
            <CardContent className="pt-5 pb-3 flex flex-col min-h-0 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm text-gray-700">Categories</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAddingCategory(true)}
                  className="h-7 px-2 text-[#10b981] hover:text-[#059669] hover:bg-[#10b981]/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <AnimatePresence>
                {addingCategory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddCategory();
                          if (e.key === "Escape") setAddingCategory(false);
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8 bg-[#10b981] hover:bg-[#059669] text-white shrink-0"
                        onClick={handleAddCategory}
                      >
                        Add
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto min-h-0">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <SortableCategory
                          key={cat._id}
                          category={cat}
                          isSelected={selectedCategory === cat._id}
                          itemCount={allItemCounts[cat._id] || 0}
                          onClick={() => setSelectedCategory(cat._id)}
                          onDelete={() => handleDeleteCategory(cat._id)}
                          onRename={(newName) => handleRenameCategory(cat._id, newName)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {categories.length === 0 && (
                  <div className="text-center py-10">
                    <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    <p className="text-gray-400 text-sm">No categories yet</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setAddingCategory(true)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add first category
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Panel: Items ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h2 className="font-semibold text-lg text-gray-800">
                {selectedCategoryName}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
              </p>
            </div>
            {selectedCategory && (
              <Button
                onClick={openAddItem}
                className="bg-[#10b981] hover:bg-[#059669] text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            )}
          </div>

          {/* Search */}
          {selectedCategory && items.length > 0 && (
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="pl-9 h-9 text-sm"
              />
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto min-h-0 p-1">
            {selectedCategory && filteredItems.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Card
                        className={`overflow-hidden transition-all hover:shadow-md ${
                          !item.isAvailable ? "opacity-60" : ""
                        }`}
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center gap-4 p-3">
                            {/* Image */}
                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-gray-300" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm text-gray-800 truncate">
                                  {item.name}
                                </h3>
                                {item.dietaryPreference && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                                      item.dietaryPreference === "veg"
                                        ? "bg-green-100 text-green-600"
                                        : item.dietaryPreference === "non-veg"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-yellow-100 text-yellow-600"
                                    }`}
                                  >
                                    {item.dietaryPreference.replace("-", " ")}
                                  </span>
                                )}
                                {!item.isAvailable && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-red-50 text-red-500 shrink-0"
                                  >
                                    Unavailable
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {item.description || "No description"}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="font-bold text-sm text-[#10b981]">
                                  ₹{item.price}
                                </span>
                                {item.prepTime && (
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {item.prepTime}
                                  </span>
                                )}
                                {item.availableFrom && (
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {item.availableFrom} – {item.availableTo}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <Switch
                                checked={item.isAvailable}
                                onCheckedChange={() =>
                                  handleToggleAvailability(item)
                                }
                                className="scale-90"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditItem(item)}
                                className="h-8 w-8 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteItem(item._id)}
                                className="h-8 w-8 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {selectedCategory && filteredItems.length === 0 && searchQuery && (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No items match &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}

            {selectedCategory && items.length === 0 && !searchQuery && (
              <div className="text-center py-16 text-gray-400">
                <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No items in this category</p>
                <Button
                  onClick={openAddItem}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add first item
                </Button>
              </div>
            )}

            {!selectedCategory && (
              <div className="text-center py-16 text-gray-400">
                <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Select a category to manage items</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm({ ...itemForm, name: e.target.value })
                }
                placeholder="e.g. Margherita Pizza"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="A brief description"
              />
            </div>
            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input
                type="number"
                value={itemForm.price}
                onChange={(e) =>
                  setItemForm({ ...itemForm, price: e.target.value })
                }
                placeholder="0"
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prep Time</Label>
                <Input
                  value={itemForm.prepTime}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, prepTime: e.target.value })
                  }
                  placeholder="e.g. 15 mins"
                />
              </div>
              <div className="space-y-2">
                <Label>Dietary Info</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setItemForm({ ...itemForm, dietaryPreference: itemForm.dietaryPreference === "veg" ? "" : "veg" })}
                    className={`flex-1 transition-colors ${
                      itemForm.dietaryPreference === "veg"
                        ? "bg-green-500/20 border-green-500/50 text-green-600 hover:bg-green-500/30 hover:text-green-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    Veg
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setItemForm({ ...itemForm, dietaryPreference: itemForm.dietaryPreference === "non-veg" ? "" : "non-veg" })}
                    className={`flex-1 transition-colors ${
                      itemForm.dietaryPreference === "non-veg"
                        ? "bg-red-500/20 border-red-500/50 text-red-600 hover:bg-red-500/30 hover:text-red-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    Non-Veg
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Label
                htmlFor="image-upload"
                className="flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50 h-10"
              >
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 truncate font-normal">
                  {itemImage?.name || "Upload image"}
                </span>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setItemImage(e.target.files?.[0] || null)}
                />
              </Label>
            </div>
            <div className="flex items-center justify-between">
              <Label>Available</Label>
              <Switch
                checked={itemForm.isAvailable}
                onCheckedChange={(v) =>
                  setItemForm({ ...itemForm, isAvailable: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Time Restriction</Label>
              <Switch
                checked={itemForm.hasTimeRestriction}
                onCheckedChange={(v) =>
                  setItemForm({ ...itemForm, hasTimeRestriction: v })
                }
              />
            </div>
            {itemForm.hasTimeRestriction && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="time"
                    value={itemForm.availableFrom}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        availableFrom: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input
                    type="time"
                    value={itemForm.availableTo}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        availableTo: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
            <Button
              onClick={handleSaveItem}
              disabled={savingItem || !itemForm.name || !itemForm.price}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
            >
              {savingItem ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingItem ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
