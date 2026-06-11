import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Impressum | TableQ — Smart QR Restaurant Ordering",
  description:
    "Legal Notice and Impressum for TableQ Solutions. Authorized representatives, contact information, and registration identifiers.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Impressum
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Legal Disclosure (Required by EU Web Regulations)
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Information According to § 5 TMG</h2>
            <p className="font-semibold text-slate-700">TableQ Solutions GmbH</p>
            <p>
              Gormannstraße 14
              <br />
              10119 Berlin
              <br />
              Germany
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Represented By</h2>
            <p>Akarsh Rajput, Managing Director</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Contact Information</h2>
            <p>
              <strong>Phone:</strong> +49 (0) 30 1234 5678
              <br />
              <strong>Email:</strong>{" "}
              <a href="mailto:info@tableq.com" className="text-emerald-600 hover:underline">
                info@tableq.com
              </a>
              <br />
              <strong>Website:</strong>{" "}
              <a href="https://tableq.com" className="text-emerald-600 hover:underline">
                https://tableq.com
              </a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Register Entry</h2>
            <p>
              Entry in the Commercial Register (Handelsregister)
              <br />
              <strong>Register Court:</strong> Amtsgericht Charlottenburg (Berlin)
              <br />
              <strong>Register Number:</strong> HRB 987654 B
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Value Added Tax (VAT)</h2>
            <p>
              VAT Identification Number according to § 27 a of the German Value Added Tax Act (Umsatzsteuergesetz):
              <br />
              <strong>VAT ID:</strong> DE 123 456 789
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">EU Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (ODR):{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>.
              <br />
              Our email address can be found above in the Legal Disclosure. We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
