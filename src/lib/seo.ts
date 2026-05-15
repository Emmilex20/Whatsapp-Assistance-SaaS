import { companyInfo } from "@/lib/company";

export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  companyInfo.website.replace(/\/$/, "");

export const seoKeywords = [
  "WhatsApp restaurant assistant",
  "WhatsApp Business assistant",
  "Business WhatsApp automation",
  "WhatsApp ordering system for restaurants",
  "WhatsApp ordering system for Business",
  "AI restaurant assistant",
  "AI Business assistant",
  "restaurant chatbot Nigeria",
  "Business chatbot Nigeria",
  "WhatsApp chatbot for restaurants",
  "WhatsApp chatbot for Business",
  "restaurant order management software",
  "Business order management software",
  "food vendor WhatsApp automation",
  "restaurant customer support software",
  "Business customer support software",
  "restaurant AI replies",
  "Business AI replies",
  "ServeFlow",
  "ServeFlow restaurant assistant",
  "ServeFlow Business assistant",
  "WhatsApp business automation Nigeria",
  "restaurant SaaS Nigeria",
  "Business SaaS Nigeria",
];

export const defaultSeoDescription =
  "ServeFlow is a WhatsApp Business assistant and operations dashboard that helps Business owners reply faster, manage orders, automate customer questions, plan campaigns, and review business reports.";

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const publicRoutes = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/privacy-policy",
    priority: 0.4,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/terms",
    priority: 0.4,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/contact",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
];
