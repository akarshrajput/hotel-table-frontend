"use client";

import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-50/80 border-b border-slate-200/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Table<span className="text-[#10b981]">Q</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm"
          >
            Register Hotel
          </Link>
        </div>
      </div>
    </nav>
  );
}
