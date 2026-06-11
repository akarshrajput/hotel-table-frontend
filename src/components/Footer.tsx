"use client";

import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <ChefHat className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900">
            Table<span className="text-[#10b981]">Q</span>
          </span>
        </div>
        
        <div className="flex gap-6 text-xs text-slate-500 font-medium">
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-900 transition-colors">
            Terms of Service
          </Link>
          <Link href="/impressum" className="hover:text-slate-900 transition-colors">
            Impressum
          </Link>
        </div>

        <p className="text-slate-400 text-xs">
          © {new Date().getFullYear()} TableQ. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
