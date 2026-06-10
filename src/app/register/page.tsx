"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import {
  ChefHat,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");

  // Step 1 — Restaurant Info
  const [restaurantName, setRestaurantName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // Step 2 — Owner Account
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "")
      .substring(0, 50);
  };

  const handleNameChange = (name: string) => {
    setRestaurantName(name);
    const newSlug = generateSlug(name);
    setSlug(newSlug);
    if (newSlug.length >= 3) {
      checkSlug(newSlug);
    } else {
      setSlugStatus("idle");
    }
  };

  const checkSlug = useCallback(async (slugToCheck: string) => {
    if (slugToCheck.length < 3) return;
    setSlugStatus("checking");
    try {
      const { data } = await api.get(
        `/api/restaurants/check-slug?slug=${slugToCheck}`
      );
      setSlugStatus(data.available ? "available" : "taken");
    } catch {
      setSlugStatus("idle");
    }
  }, []);

  const handleSlugChange = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 50);
    setSlug(cleaned);
    if (cleaned.length >= 3) {
      checkSlug(cleaned);
    } else {
      setSlugStatus("idle");
    }
  };

  const uploadFile = async (file: File, endpoint: string) => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (slugStatus === "taken") {
      toast.error("Slug is already taken");
      return;
    }

    if (!showOtpScreen) {
      setLoading(true);
      try {
        await api.post("/api/auth/otp/send", {
          email,
          type: "register",
        });
        toast.success("Verification code sent to your email!");
        setShowOtpScreen(true);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Failed to send verification code");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      let logoUrl = "";
      let coverImageUrl = "";

      // Upload images if provided (these are optional during registration)
      if (logoFile) {
        try {
          logoUrl = await uploadFile(logoFile, "/api/upload/hotel-image");
        } catch {
          // Image upload failed, continue without image
        }
      }
      if (coverFile) {
        try {
          coverImageUrl = await uploadFile(coverFile, "/api/upload/hotel-image");
        } catch {
          // Image upload failed, continue without image
        }
      }

      const { data } = await api.post("/api/auth/owner/register", {
        restaurantName,
        slug,
        description,
        logoUrl,
        coverImageUrl,
        ownerName,
        email,
        password,
        otp,
      });

      login(data.token, data.user);
      toast.success("Restaurant registered successfully!");
      router.push(`/${data.user.slug}/dashboard`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const canProceed =
    restaurantName && slug.length >= 3 && slugStatus !== "taken";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Table<span className="text-[#10b981]">Q</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Register your restaurant
          </h1>
          <p className="text-slate-900/40 text-sm">
            Step {step} of 2 —{" "}
            {step === 1 ? "Restaurant Info" : "Owner Account"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6 max-w-xs mx-auto">
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${
              step >= 1 ? "bg-[#10b981]" : "bg-white/10"
            }`}
          />
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${
              step >= 2 ? "bg-[#10b981]" : "bg-white/10"
            }`}
          />
        </div>

        <Card className="bg-white/[0.03] border-slate-200 backdrop-blur-xl">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-slate-900/70 text-sm">
                      Restaurant Name *
                    </Label>
                    <Input
                      placeholder="e.g. Dominos Pizza"
                      value={restaurantName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900/70 text-sm">Slug *</Label>
                    <div className="relative">
                      <Input
                        placeholder="dominos-pizza"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50 pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugStatus === "checking" && (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-900/30" />
                        )}
                        {slugStatus === "available" && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {slugStatus === "taken" && (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-slate-900/20 text-xs">
                      Your menu URL: tableq.com/{slug || "your-slug"}
                    </p>
                    {slugStatus === "taken" && (
                      <p className="text-red-400 text-xs">
                        This slug is already taken
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900/70 text-sm">Description</Label>
                    <Input
                      placeholder="A brief description of your restaurant"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-900/70 text-sm">Logo</Label>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload className="w-4 h-4 text-slate-900/30" />
                        <span className="text-slate-900/30 text-sm truncate">
                          {logoFile ? logoFile.name : "Upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setLogoFile(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-900/70 text-sm">
                        Cover Image
                      </Label>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload className="w-4 h-4 text-slate-900/30" />
                        <span className="text-slate-900/30 text-sm truncate">
                          {coverFile ? coverFile.name : "Upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setCoverFile(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={!canProceed}
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold hover:opacity-90 h-11"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {!showOtpScreen ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-900/70 text-sm">Full Name *</Label>
                        <Input
                          placeholder="John Doe"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900/70 text-sm">Email *</Label>
                        <Input
                          type="email"
                          placeholder="owner@restaurant.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900/70 text-sm">Password *</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-900/30 hover:text-slate-900/60"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900/70 text-sm">
                          Confirm Password *
                        </Label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50"
                        />
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-red-400 text-xs">
                            Passwords don&apos;t match
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="border-slate-200 text-slate-900/50 hover:bg-white hover:text-slate-900"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            loading ||
                            !ownerName ||
                            !email ||
                            !password ||
                            password !== confirmPassword
                          }
                          className="flex-1 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold hover:opacity-90 h-11"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Send Verification Code"
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 text-center py-2">
                        <p className="text-slate-900/70 text-sm">
                          A 6-digit verification code has been sent to
                        </p>
                        <p className="text-[#10b981] font-semibold text-sm">{email}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900/70 text-sm">Verification Code (OTP) *</Label>
                        <Input
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))}
                          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50 tracking-[0.5em] text-center font-bold text-lg"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={loading}
                          onClick={() => setShowOtpScreen(false)}
                          className="border-slate-200 text-slate-900/50 hover:bg-white hover:text-slate-900"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          Edit Details
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || otp.length !== 6}
                          className="flex-1 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold hover:opacity-90 h-11"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Verify & Register"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-slate-900/30 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#10b981] hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
