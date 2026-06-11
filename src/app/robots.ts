import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms", "/impressum", "/login", "/register"],
      disallow: [
        "/*/dashboard",
        "/*/orders",
        "/*/settings",
        "/*/tables",
        "/*/history",
        "/*/menu-management",
        "/*/menu/table/*",
        "/admin/*",
        "/api/*",
      ],
    },
    sitemap: "https://tableq.com/sitemap.xml",
  };
}
