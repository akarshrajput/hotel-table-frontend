import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | TableQ — Smart QR Restaurant Ordering",
  description:
    "Terms and conditions for TableQ. Learn about terms of use for QR menu cards and live kitchen dashboards.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Last Updated: June 11, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">1. Agreement to Terms</h2>
            <p>
              By accessing or using the TableQ ordering software, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">2. Owner Accounts & Security</h2>
            <p>
              To set up digital menus and generate custom table QR codes, you must register for an owner account.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Owners must provide valid emails for OTP validation.</li>
              <li>You are solely responsible for maintaining the confidentiality of your temporary OTP codes and account login tokens.</li>
              <li>You must immediately notify TableQ of any unauthorized use of your dashboard details.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">3. Service Provisions & Availability</h2>
            <p>
              TableQ operates a WebSocket-based live orders transmission network:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We strive to ensure continuous network connections for incoming diner orders, but cannot guarantee 100% uptime due to internet service providers or browser notification permissions.</li>
              <li>Active orders are automatically deleted after 24 hours to clear active memory. TableQ is not responsible for storing long-term tax or financial logs unless configured under active paid plans.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">4. Prohibited Uses</h2>
            <p>
              When configuring restaurant slugs and inputting menu details, owners agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Upload offensive images or insert malicious description text.</li>
              <li>Configure fake slugs pretending to represent other major chain brands without authorization.</li>
              <li>Bypass OTP structures or exploit Kanban active drag handlers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">5. Limitation of Liability</h2>
            <p>
              In no event shall TableQ, nor its directors or employees, be liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this software, whether under contract, tort, or otherwise.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">6. Amendments & Contact</h2>
            <p>
              We reserve the right to amend these Terms at any time. Changes will be posted directly to this URL. For support questions, please email{" "}
              <a href="mailto:support@tableq.com" className="text-emerald-600 hover:underline">
                support@tableq.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
