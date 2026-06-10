"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Zap,
  LayoutGrid,
  Clock,
  Smartphone,
  BarChart3,
  ArrowRight,
  ChefHat,
} from "lucide-react";

// ─── Animated Counter ──────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Fade In Up Wrapper ────────────────────────────────────────
function FadeInUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Features Data ─────────────────────────────────────────────
const features = [
  {
    icon: Zap,
    title: "Real-time Orders",
    description:
      "Orders appear instantly on your dashboard the moment a customer taps 'Place Order'.",
  },
  {
    icon: QrCode,
    title: "QR per Table",
    description:
      "Each table gets a unique QR code. Customers scan and go — no app download needed.",
  },
  {
    icon: LayoutGrid,
    title: "Menu Management",
    description:
      "Drag-and-drop categories, toggle item availability, set time-based restrictions.",
  },
  {
    icon: Clock,
    title: "Order History",
    description:
      "Full order history with filters by date, table, and status. Track every rupee.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first Design",
    description:
      "Customers get a premium mobile experience. Dark luxury UI that feels like a native app.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description:
      "Daily revenue, order counts, active tables — everything at a glance.",
  },
];

const steps = [
  {
    number: "01",
    title: "Scan QR",
    description: "Customer scans the QR code placed on their table",
  },
  {
    number: "02",
    title: "Browse Menu",
    description: "Beautiful mobile menu with images, descriptions, and prices",
  },
  {
    number: "03",
    title: "Order Instantly",
    description: "Add items to cart and place order — it appears on your screen in real-time",
  },
];

// ─── Page Component ────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Table<span className="text-[#10b981]">Q</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-slate-900/70 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-60 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative z-10">


          <FadeInUp delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
              Your menu.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#10b981]">
                Your tables.
              </span>
              <br />
              Zero friction.
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-lg sm:text-xl text-slate-900/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              The modern QR ordering system that lets your customers scan,
              browse, and order — while you manage everything in real-time from
              one dashboard.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group px-8 py-3.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl text-base hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 border border-slate-200 text-slate-900/70 font-medium rounded-xl text-base hover:bg-white hover:border-slate-300 transition-all"
              >
                Owner Login
              </Link>
            </div>
          </FadeInUp>
        </div>

        {/* Hero glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#10b981]/5 blur-[120px] rounded-full" />
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <p className="text-[#10b981] text-sm font-semibold uppercase tracking-widest mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Three steps to smarter service
              </h2>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <FadeInUp key={step.number} delay={i * 0.15}>
                <div className="relative group">
                  <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-[#10b981]/20 transition-all duration-500">
                    <div className="text-5xl font-black text-[#10b981]/10 mb-4 font-mono">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-slate-900/40 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:flex absolute top-1/2 -right-8 -translate-y-1/2 w-8 h-8 items-center justify-center text-slate-900/20 z-10">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.04)_0%,_transparent_60%)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeInUp>
            <div className="text-center mb-16">
              <p className="text-[#10b981] text-sm font-semibold uppercase tracking-widest mb-3">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Everything you need to run
                <br className="hidden sm:block" /> your restaurant digitally
              </h2>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FadeInUp key={feature.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-[#10b981]/20 transition-colors duration-500 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center mb-4 group-hover:bg-[#10b981]/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-900/40 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 px-6 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            <FadeInUp>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#10b981] mb-2">
                  <AnimatedCounter target={500} suffix="+" />
                </div>
                <p className="text-slate-900/40 text-sm">Tables Managed</p>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.15}>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#10b981] mb-2">
                  <AnimatedCounter target={10000} suffix="+" />
                </div>
                <p className="text-slate-900/40 text-sm">Orders Served</p>
              </div>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#10b981] mb-2">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <p className="text-slate-900/40 text-sm">Restaurants Onboarded</p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeInUp>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Start serving{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#34d399]">
                smarter
              </span>{" "}
              today
            </h2>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <p className="text-slate-900/40 text-lg mb-10 max-w-xl mx-auto">
              Set up your restaurant in minutes. Generate QR codes for your
              tables. Start receiving orders instantly.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold rounded-xl text-lg hover:shadow-[0_0_60px_rgba(16,185,129,0.3)] transition-all duration-300"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
              <ChefHat className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">
              Table<span className="text-[#10b981]">Q</span>
            </span>
          </div>
          <p className="text-slate-900/30 text-xs">
            © {new Date().getFullYear()} TableQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
