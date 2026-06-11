"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthStore } from "@/store/authStore";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (showOtpScreen && otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = { email, password };
      if (showOtpScreen) {
        payload.otp = otp;
      }

      const { data } = await api.post("/api/auth/admin/login", payload);

      if (data.requiresOtp) {
        toast.success("Verification code sent to your email!");
        setShowOtpScreen(true);
      } else {
        login(data.token, data.user);
        toast.success("Welcome, Admin!");
        router.push("/admin/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-sm border border-[#10b981]/20 mb-4">
            <Shield className="w-6 h-6 text-[#10b981]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Access</h1>
          <p className="text-slate-900/40 text-sm">
            Super admin control panel
          </p>
        </div>

        <Card className="bg-white/[0.03] border-slate-200 backdrop-blur-xl">
          <CardHeader className="pb-0" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!showOtpScreen ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-slate-900/70 text-sm">
                      Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@hotel-table.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50 focus:ring-[#10b981]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="admin-password"
                      className="text-slate-900/70 text-sm"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-900/20 focus:border-[#10b981]/50 focus:ring-[#10b981]/20 pr-10"
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

                  <Button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold hover:opacity-90 h-11"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Sign In as Admin"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2 text-center py-2">
                    <p className="text-slate-900/70 text-sm">
                      A 6-digit verification code has been sent to
                    </p>
                    <p className="text-[#10b981] font-semibold text-sm">{email}</p>
                  </div>

                  <div className="space-y-3 flex flex-col">
                    <Label className="text-slate-900/70 flex justify-center text-sm">Verification Code (OTP) *</Label>
                    <div className="flex justify-center py-2">
                      <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-11 h-14 sm:w-12 sm:h-14 text-xl bg-white border-slate-200 data-[active=true]:border-[#10b981] data-[active=true]:ring-[#10b981]/20" />
                          <InputOTPSlot index={1} className="w-11 h-14 sm:w-12 sm:h-14 text-xl bg-white border-slate-200 data-[active=true]:border-[#10b981] data-[active=true]:ring-[#10b981]/20" />
                          <InputOTPSlot index={2} className="w-11 h-14 sm:w-12 sm:h-14 text-xl bg-white border-slate-200 data-[active=true]:border-[#10b981] data-[active=true]:ring-[#10b981]/20" />
                        </InputOTPGroup>
                        <InputOTPSeparator className="text-slate-300" />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className="w-11 h-14 sm:w-12 sm:h-14 text-xl bg-white border-slate-200 data-[active=true]:border-[#10b981] data-[active=true]:ring-[#10b981]/20" />
                          <InputOTPSlot index={4} className="w-11 h-14 sm:w-12 sm:h-14 text-xl bg-white border-slate-200 data-[active=true]:border-[#10b981] data-[active=true]:ring-[#10b981]/20" />
                          <InputOTPSlot index={5} className="w-11 h-14 sm:w-12 sm:h-14 text-xl bg-white border-slate-200 data-[active=true]:border-[#10b981] data-[active=true]:ring-[#10b981]/20" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold hover:opacity-90 h-11"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowOtpScreen(false)}
                    className="w-full text-center text-slate-900/30 hover:text-slate-900/50 text-xs mt-2 underline bg-transparent border-none"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-slate-900/20 text-xs hover:text-slate-900/40 transition-colors"
          >
            ← Owner Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
