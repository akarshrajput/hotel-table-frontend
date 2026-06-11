import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "TableQ | Smart QR Code Menu & Real-Time Ordering System for Restaurants",
  description:
    "Digitize your dining service with TableQ. Let customers scan QR codes to browse menus and order instantly. Manage kitchen orders live from a modern Kanban board.",
  keywords: [
    "QR code menu",
    "restaurant ordering system",
    "digital menu card",
    "contactless dining",
    "kitchen Kanban board",
    "TableQ",
    "food order tracker",
    "scan to order restaurant",
    "real-time order management",
    "restaurant SaaS",
    "digital menu for hotel",
    "contactless menu card",
  ],
  alternates: {
    canonical: "https://tableq.com",
  },
  openGraph: {
    title: "TableQ | Smart QR Code Menu & Real-Time Ordering System",
    description:
      "Modern QR-based menu & real-time kitchen ordering system for restaurants. Scan to browse, customize plates, and track orders instantly.",
    url: "https://tableq.com",
    siteName: "TableQ",
    images: [
      {
        url: "https://tableq.com/1_Menu_Management.gif", // uses a product demo gif as open graph image
        width: 1200,
        height: 630,
        alt: "TableQ Restaurant Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TableQ | Smart QR Restaurant Ordering System",
    description:
      "Transform restaurant service with table QR codes. Instant digital ordering, WebSocket kitchen kanban boards, and sound alert notifications.",
    images: ["https://tableq.com/2_Orders_Management.gif"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TableQ",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "browserRequirements": "Requires HTML5 compatible browser",
    "softwareVersion": "1.0.0",
    "url": "https://tableq.com",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "category": "Free / Subscription"
    },
    "description": "Smart QR code menu and real-time ordering system for modern restaurants. Let diners scan, browse, and place orders directly to the kitchen.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "128"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TableQ Solutions Ltd.",
      "url": "https://tableq.com",
      "logo": "https://tableq.com/next.svg"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
