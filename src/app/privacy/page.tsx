import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | TableQ — Smart QR Restaurant Ordering",
  description:
    "Privacy policy details for TableQ. Learn how we collect, store, and manage your restaurant and table order data safely.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Last Updated: June 11, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">1. Information We Collect</h2>
            <p>
              We collect information to provide better services to all our users. The data we collect includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Owner Account Information:</strong> Full Name, email address, password, and restaurant configuration parameters.
              </li>
              <li>
                <strong>Diner / Guest Data:</strong> We temporarily capture active orders mapping items and quantities directly to a table number. We do NOT require diners to create accounts or download apps.
              </li>
              <li>
                <strong>Sound Notification Preferences:</strong> Browser permission and preferences to ring audio indicators for new kitchen orders.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">2. How We Use Information</h2>
            <p>
              We use the collected information for the following specific purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>To initialize and sync real-time WebSocket communication channels between Diner views and the Kitchen Kanban board.</li>
              <li>To send One-Time Password (OTP) validation keys to restaurant owner emails to keep dashboard settings secure.</li>
              <li>To improve our page load times and user experience styling parameters.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">3. Data Retention & Expiry</h2>
            <p>
              In order to keep systems fast and protect user information:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Automatic 24-Hour Expiry:</strong> All active and finished table orders are automatically pruned and deleted from active servers 24 hours after creation.
              </li>
              <li>
                <strong>Account Cancellation:</strong> Restaurant owners can permanently delete their slots, which instantly clears all associated menu items, categories, and table configurations from our databases.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">4. Third-Party Services</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">5. Contact Information</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please feel free to reach out to us at{" "}
              <a href="mailto:privacy@tableq.com" className="text-emerald-600 hover:underline">
                privacy@tableq.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
