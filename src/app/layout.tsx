import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { PageScrollIndicator } from "@/components/shared/page-scroll-indicator";
import { appName } from "@/lib/site";
import {
  absoluteUrl,
  defaultSeoDescription,
  seoKeywords,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: appName,
  title: {
    default: "ServeFlow | WhatsApp Business Assistant",
    template: "%s | ServeFlow",
  },
  description: defaultSeoDescription,
  keywords: seoKeywords,
  authors: [{ name: appName }],
  creator: appName,
  publisher: appName,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: appName,
    title: "ServeFlow | WhatsApp Business Assistant",
    description: defaultSeoDescription,
    images: [
      {
        url: absoluteUrl("/logo.png"),
        width: 1254,
        height: 1254,
        alt: "ServeFlow logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ServeFlow | WhatsApp Business Assistant",
    description: defaultSeoDescription,
    images: [absoluteUrl("/logo.png")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster richColors position="top-right" />
          <PageScrollIndicator />
        </body>
      </html>
    </ClerkProvider>
  );
}
