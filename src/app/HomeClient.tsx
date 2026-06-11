"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Zap,
  LayoutGrid,
  Clock,
  Smartphone,
  ChefHat,
  ArrowRight,
  ChevronDown,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── FAQ Accordion Item ─────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 group-hover:text-emerald-600 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-2 text-sm text-slate-600 leading-relaxed pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Floating GIFs Data ──────────────────────────────────────────
interface FloatingGif {
  id: string;
  src: string;
  title: string;
  desc: string;
  type: "browser" | "mobile";
  className: string;
  yRange: number[];
  xRange: number[];
  rotation: number;
  duration: number;
  delay: number;
}

const floatingGifs: FloatingGif[] = [
  {
    id: "menu-mgmt",
    src: "/1_Menu_Management.gif",
    title: "Menu Management",
    desc: "Easily update dish details, reorder categories, toggle availability, and set pricing in real-time.",
    type: "browser",
    className: "absolute left-[10px] xl:left-[60px] top-[5%] w-[180px] xl:w-[220px] hidden lg:block z-10 lg:scale-75 xl:scale-100 origin-right transition-all",
    yRange: [-8, 8],
    xRange: [-4, 4],
    rotation: -3,
    duration: 8,
    delay: 0,
  },
  {
    id: "order-mgmt",
    src: "/2_Orders_Management.gif",
    title: "Live Order Hub",
    desc: "Manage incoming tables orders in real-time. Drag cards from New to Preparing and Served with live status updates.",
    type: "browser",
    className: "absolute left-[-20px] xl:left-[20px] top-[36%] w-[190px] xl:w-[230px] hidden lg:block z-10 lg:scale-75 xl:scale-100 origin-right transition-all",
    yRange: [6, -10],
    xRange: [-6, 6],
    rotation: 2,
    duration: 10,
    delay: 1.5,
  },
  {
    id: "table-mgmt",
    src: "/6_Table_Management.gif",
    title: "Table Layout",
    desc: "Create, configure, and monitor restaurant tables. Download high-quality custom QR codes mapped specifically to each table.",
    type: "browser",
    className: "absolute left-[30px] xl:left-[80px] top-[66%] w-[170px] xl:w-[200px] hidden lg:block z-10 lg:scale-75 xl:scale-100 origin-right transition-all",
    yRange: [-6, 6],
    xRange: [4, -4],
    rotation: -1,
    duration: 9,
    delay: 0.8,
  },
  {
    id: "user-menu",
    src: "/4_User_Menu.gif",
    title: "Diner Mobile Menu",
    desc: "A premium, lightning-fast digital menu with category filtering, dietary preference tags, and instant cart additions.",
    type: "mobile",
    className: "absolute right-[10px] xl:right-[60px] top-[4%] w-[95px] xl:w-[115px] hidden lg:block z-10 lg:scale-75 xl:scale-100 origin-left transition-all",
    yRange: [-10, 10],
    xRange: [-3, 3],
    rotation: 4,
    duration: 11,
    delay: 0.5,
  },
  {
    id: "user-order",
    src: "/5_User_Order.gif",
    title: "Live Order Tracker",
    desc: "Diners can view their order summary, track preparation progress, and receive live kitchen updates in real-time.",
    type: "mobile",
    className: "absolute right-[-20px] xl:right-[20px] top-[34%] w-[100px] xl:w-[120px] hidden lg:block z-10 lg:scale-75 xl:scale-100 origin-left transition-all",
    yRange: [8, -8],
    xRange: [4, -4],
    rotation: -4,
    duration: 8.5,
    delay: 2,
  },
  {
    id: "settings-mgmt",
    src: "/3_Settings_Management.gif",
    title: "Store Settings",
    desc: "Configure restaurant details, upload branding, set opening hours, and control active status.",
    type: "browser",
    className: "absolute right-[20px] xl:right-[70px] top-[64%] w-[180px] xl:w-[215px] hidden lg:block z-10 lg:scale-75 xl:scale-100 origin-left transition-all",
    yRange: [-5, 5],
    xRange: [-4, 4],
    rotation: 1,
    duration: 9.5,
    delay: 1.2,
  },
];

// ─── Device Mockup Frame Component ────────────────────────────────
function DeviceFrame({
  src,
  title,
  type,
  onClick,
}: {
  src: string;
  title: string;
  type: "browser" | "mobile";
  onClick?: () => void;
}) {
  if (type === "browser") {
    return (
      <div
        onClick={onClick}
        className="w-full bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200/80 cursor-pointer hover:border-emerald-500/50 hover:shadow-emerald-100/30 transition-all duration-300 group/frame"
      >
        {/* Browser Top Bar */}
        <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-1.5 border-b border-slate-200">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 group-hover/frame:bg-red-500 transition-colors" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 group-hover/frame:bg-yellow-500 transition-colors" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 group-hover/frame:bg-green-500 transition-colors" />
          <div className="text-[9px] text-slate-400 font-mono mx-auto truncate pr-6 select-none transition-colors group-hover/frame:text-slate-500">
            tableq.com/dashboard
          </div>
        </div>
        {/* Browser Content */}
        <div className="overflow-hidden bg-slate-900 aspect-video relative">
          <img
            src={src}
            alt={title}
            className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-700"
          />
        </div>
      </div>
    );
  }

  // Smartphone shell
  return (
    <div
      onClick={onClick}
      className="w-full border-[6px] border-slate-900 rounded-[28px] overflow-hidden bg-slate-900 shadow-xl cursor-pointer hover:border-emerald-500/50 transition-all duration-300 relative group/frame"
    >
      {/* Notch / Speaker */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
        <div className="w-4 h-0.5 bg-slate-700 rounded-full" />
      </div>
      {/* Content */}
      <div className="aspect-[9/18] relative bg-slate-950 overflow-hidden pt-3.5">
        <img
          src={src}
          alt={title}
          className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
        />
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [selectedGif, setSelectedGif] = useState<FloatingGif | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05)_0%,_transparent_50%)] -z-10" />

        {/* Left Column Showcase (strictly confined to left margin) */}
        <div className="absolute left-[-220px] xl:left-[-180px] 2xl:left-[-110px] top-44 bottom-24 w-[180px] xl:w-[240px] hidden lg:flex flex-col justify-between pointer-events-none z-10">
          {/* Card 1: Menu Management */}
          <motion.div
            className="pointer-events-auto self-start -translate-x-12 xl:-translate-x-32 2xl:-translate-x-40 cursor-pointer"
            style={{ rotate: -4 }}
            animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05, zIndex: 50 }}
            onClick={() => setSelectedGif(floatingGifs[0])}
          >
            <div className="relative group w-[170px] xl:w-[210px] opacity-95 transition-opacity duration-300 hover:opacity-100">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <DeviceFrame src="/1_Menu_Management.gif" title="Menu Management" type="browser" />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold py-1 px-3.5 rounded-full shadow-md backdrop-blur-sm whitespace-nowrap tracking-wide border border-white/10 z-20 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/40">
                Menu Builder
              </div>
            </div>
          </motion.div>

          {/* Card 2: Live Order Hub */}
          <motion.div
            className="pointer-events-auto self-start -translate-x-4 xl:-translate-x-12 2xl:-translate-x-16 cursor-pointer"
            style={{ rotate: 3 }}
            animate={{ y: [8, -8, 8], x: [4, -4, 4] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            whileHover={{ scale: 1.05, zIndex: 50 }}
            onClick={() => setSelectedGif(floatingGifs[1])}
          >
            <div className="relative group w-[185px] xl:w-[225px] opacity-100 shadow-2xl">
              <div className="absolute inset-0 bg-emerald-500/15 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <DeviceFrame src="/2_Orders_Management.gif" title="Live Order Hub" type="browser" />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold py-1 px-3.5 rounded-full shadow-md backdrop-blur-sm whitespace-nowrap tracking-wide border border-white/10 z-20 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/40">
                Live Kitchen Kanban
              </div>
            </div>
          </motion.div>

          {/* Card 3: Table Layout */}
          <motion.div
            className="pointer-events-auto self-start -translate-x-8 xl:-translate-x-16 2xl:-translate-x-20 cursor-pointer opacity-80 blur-[0.3px]"
            style={{ rotate: -2 }}
            animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            whileHover={{ scale: 1.05, zIndex: 50, opacity: 1, filter: "none" }}
            onClick={() => setSelectedGif(floatingGifs[2])}
          >
            <div className="relative group w-[150px] xl:w-[180px]">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <DeviceFrame src="/6_Table_Management.gif" title="Table Layout" type="browser" />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold py-1 px-3.5 rounded-full shadow-md backdrop-blur-sm whitespace-nowrap tracking-wide border border-white/10 z-20 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/40">
                Table Planner
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column Showcase */}
        <div className="absolute right-[-220px] xl:right-[-180px] 2xl:right-[-110px] top-44 bottom-24 w-[180px] xl:w-[240px] hidden lg:flex flex-col justify-between items-end pointer-events-none z-10">
          {/* Card 4: Diner Mobile Menu */}
          <motion.div
            className="pointer-events-auto self-end translate-x-12 xl:translate-x-24 2xl:translate-x-32 cursor-pointer"
            style={{ rotate: 5 }}
            animate={{ y: [-8, 8, -8], x: [3, -3, 3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            whileHover={{ scale: 1.05, zIndex: 50 }}
            onClick={() => setSelectedGif(floatingGifs[3])}
          >
            <div className="relative group w-[95px] xl:w-[115px] opacity-95 transition-opacity duration-300 hover:opacity-100">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <DeviceFrame src="/4_User_Menu.gif" title="Diner Mobile Menu" type="mobile" />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold py-1 px-3.5 rounded-full shadow-md backdrop-blur-sm whitespace-nowrap tracking-wide border border-white/10 z-20 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/40">
                Diner Mobile Menu
              </div>
            </div>
          </motion.div>

          {/* Card 5: Live Order Tracker */}
          <motion.div
            className="pointer-events-auto self-end translate-x-4 xl:translate-x-12 2xl:translate-x-16 cursor-pointer animate-pulse-slow"
            style={{ rotate: -4 }}
            animate={{ y: [7, -7, 7], x: [-4, 4, -4] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            whileHover={{ scale: 1.05, zIndex: 50 }}
            onClick={() => setSelectedGif(floatingGifs[4])}
          >
            <div className="relative group w-[100px] xl:w-[120px] opacity-100 shadow-2xl">
              <div className="absolute inset-0 bg-emerald-500/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <DeviceFrame src="/5_User_Order.gif" title="Live Order Tracker" type="mobile" />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold py-1 px-3.5 rounded-full shadow-md backdrop-blur-sm whitespace-nowrap tracking-wide border border-white/10 z-20 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/40">
                Diner Order Tracker
              </div>
            </div>
          </motion.div>

          {/* Card 6: Store Settings */}
          <motion.div
            className="pointer-events-auto self-end translate-x-8 xl:translate-x-16 2xl:translate-x-20 cursor-pointer opacity-80 blur-[0.3px]"
            style={{ rotate: 2 }}
            animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
            transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            whileHover={{ scale: 1.05, zIndex: 50, opacity: 1, filter: "none" }}
            onClick={() => setSelectedGif(floatingGifs[5])}
          >
            <div className="relative group w-[170px] xl:w-[200px]">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <DeviceFrame src="/3_Settings_Management.gif" title="Store Settings" type="browser" />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold py-1 px-3.5 rounded-full shadow-md backdrop-blur-sm whitespace-nowrap tracking-wide border border-white/10 z-20 transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/40">
                Store Settings
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] font-bold tracking-tight leading-[0.9] text-slate-900 mb-6"
          >
            Your menu.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#10b981]">
              Your tables.
            </span>
            <br />
            Zero friction.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-slate-900/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Modern digital menus and live QR ordering for restaurants. Guests scan, browse, and order instantly, while you manage everything in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto group px-8 py-3.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold rounded-xl text-base hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2"
            >
              Register Your Restaurant
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-xl text-base hover:bg-slate-50 transition-all text-center"
            >
              Sign In to Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* See TableQ in Action Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto relative border-t border-slate-200/40 bg-slate-50/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            See TableQ in Action
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
            Click on any interface module below to view detailed features and interactive workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {floatingGifs.map((item) => (
            <motion.div
              key={`grid-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:border-emerald-300/80 transition-all duration-300 flex flex-col group justify-between"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="mb-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {item.type === "browser" ? "Dashboard" : "Diner App"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <div className={`mt-auto bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex justify-center items-center overflow-hidden h-[200px]`}>
                <div className={`${item.type === 'mobile' ? 'w-[90px]' : 'w-full'} transition-transform duration-300 group-hover:scale-[1.02]`}>
                  <DeviceFrame
                    src={item.src}
                    title={item.title}
                    type={item.type}
                    onClick={() => setSelectedGif(item)}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process Roadmap */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
              The Scan-to-Kitchen Journey
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              How TableQ streamlines the dining experience for both customers and owners.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Diner Journey */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                For Your Diners
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Scan QR Code</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Customers scan the custom TableQ QR code placed on their table using their phone camera. No app installation needed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Browse Menu & Order</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Explore categories, view items, customize quantities, and click &quot;Place Order&quot; in a fast, mobile-friendly interface.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Track Progress Live</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      View preparation countdowns and live order status changes (New → Preparing → Served) connected via WebSockets.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Journey */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                For Your Kitchen & Staff
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Instant Sound Notifications</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      When a new order is placed, it arrives instantly on the Owner Dashboard with a clear sound notification alert.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Manage via Kanban Board</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Drag and drop orders across stages. A dashed preview outline shows you exactly where the order card will land.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Automatic 24-Hour Expiry</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      The board stays clean automatically. Inactive tickets are safely archived 24 hours after creation, keeping your list fresh.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto font-sans">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
            Features Tailored for Restaurants
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            A comprehensive toolset to manage menus, tables, and live orders under one single interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-300 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Unique Table QR Codes</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Generate QR codes mapped to specific table numbers. Diners scan and immediately place orders identified by their table.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-300 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">WebSocket Live Synced</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              No need to refresh the page. Orders fly instantly from customer mobile browsers straight into the restaurant&apos;s active Kanban columns.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-300 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Drag-and-Drop Menu</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Reorder dishes, toggle item availability, edit prices, and manage layout categories dynamically with immediate sync to QR views.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-300 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Sound Alert Notifications</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Never miss an incoming request. Clear audio notification rings when a table submits a ticket, even when working on other browser tabs.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-300 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Estimated Preparation Time</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Estimated preparation times help set customer expectations. Diners track exactly when their food will be prepared.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-300 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Secure OTP Login</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Account security verified with temporary One-Time Passwords (OTP) sent directly to your registered owner email address.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/40 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm">
              Answers to questions commonly asked by restaurant owners.
            </p>
          </div>

          <div className="space-y-2">
            <FAQItem
              question="Do customers need to download an application to view the menu?"
              answer="No. Customers simply scan the table's QR code with their mobile device camera, and it opens the digital menu instantly in their native mobile web browser."
            />
            <FAQItem
              question="How are QR codes generated and configured?"
              answer="QR codes are automatically generated for each table number you configure in the Admin/Owner dashboard. You can download and print them directly from the Tables section."
            />
            <FAQItem
              question="How do live order updates work?"
              answer="TableQ uses WebSockets to connect the customer menu and the owner dashboard. As soon as a customer clicks 'Place Order', it sends a sound alert and prints to the 'New' column. Dragging it to 'Preparing' or 'Served' triggers a live update on the customer's order tracker screen instantly."
            />
            <FAQItem
              question="Are the orders archived automatically?"
              answer="Yes. To keep the kitchen kanban board tidy and fast, all tickets are automatically filtered out 24 hours after their creation date, regardless of their status."
            />
            <FAQItem
              question="Can we edit the menu items and prices in real-time?"
              answer="Yes. Under the Menu Management section of the owner dashboard, you can add, remove, disable, or reorder items. Changes are visible to customers scanning the QR codes immediately without page reloads."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative max-w-5xl mx-auto text-center">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          Ready to Digitise Your Restaurant Service?
        </h2>
        <p className="text-slate-600 text-base mb-10 max-w-lg mx-auto">
          Register your restaurant slug, input your menu items, configure your tables, print QR codes, and start receiving real-time digital orders.
        </p>
        <Link
          href="/register"
          className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold rounded-xl text-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Footer */}
      <Footer />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedGif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGif(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-w-3xl w-full cursor-default"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {selectedGif.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Product Demo Preview
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGif(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200/60 transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className={`flex-1 shrink-0 w-full flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100 ${selectedGif.type === 'mobile' ? 'max-w-[240px] mx-auto' : 'max-w-full'
                  }`}>
                  {selectedGif.type === 'mobile' ? (
                    <div className="border-8 border-slate-900 rounded-[32px] overflow-hidden bg-slate-900 shadow-xl w-full max-w-[200px] relative">
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                        <div className="w-6 h-0.5 bg-slate-700 rounded-full" />
                      </div>
                      <div className="aspect-[9/18] relative bg-slate-950 overflow-hidden pt-4">
                        <img src={selectedGif.src} alt={selectedGif.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-lg w-full bg-white">
                      <div className="bg-slate-100 px-3 py-2 flex items-center gap-1.5 border-b border-slate-200/80">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        <div className="text-[10px] text-slate-400 font-mono mx-auto truncate pr-8 select-none">
                          tableq.com/dashboard
                        </div>
                      </div>
                      <img src={selectedGif.src} alt={selectedGif.title} className="w-full h-auto" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Live Feature Action
                  </span>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {selectedGif.desc}
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/register"
                      onClick={() => setSelectedGif(null)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all"
                    >
                      Try It Yourself
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
