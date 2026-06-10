"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#10b981");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/api/owner/restaurant");
        if (data.restaurant) {
          setName(data.restaurant.name || "");
          setDescription(data.restaurant.description || "");
          setPrimaryColor(data.restaurant.primaryColor || "#10b981");
        }
      } catch (error) {
        toast.error("Failed to load restaurant settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", name);
      payload.append("description", description);
      payload.append("primaryColor", primaryColor);

      // Note: If you want to add image uploads (logo, cover) in the future, 
      // you would append the File objects to this FormData payload.

      await api.put("/api/owner/restaurant", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your restaurant profile and brand appearance.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Restaurant Profile</CardTitle>
            <CardDescription>
              These details are visible to your customers on the digital menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                placeholder="e.g. The Hotel Plaza"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                placeholder="Tell your customers about your restaurant..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Branding & Appearance</CardTitle>
            <CardDescription>
              Customize the colors of your customer-facing menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Primary Brand Color</Label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  {[
                    "#10b981", // Sage Green
                    "#3b82f6", // Blue
                    "#6366f1", // Indigo
                    "#8b5cf6", // Purple
                    "#ec4899", // Pink
                    "#ef4444", // Red
                    "#f97316", // Orange
                    "#f59e0b", // Amber
                    "#0f172a", // Slate
                  ].map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${
                        primaryColor === presetColor
                          ? "border-slate-900 scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: presetColor }}
                      onClick={() => setPrimaryColor(presetColor)}
                      aria-label={`Select color ${presetColor}`}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-md border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 relative cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer opacity-0"
                      aria-label="Pick a custom color"
                    />
                  </div>
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#10b981"
                    className="max-w-[120px] font-mono uppercase"
                  />
                  <span className="text-sm text-slate-500 ml-2">Custom Hex</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                This color will be used for buttons, active tabs, and highlights on your public menu.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
