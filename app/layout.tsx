import type { Metadata } from "next";
import { Mukta, Poppins, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { MobileMenuProvider } from "./components/MobileMenuContext";
import BannerAdsTop from "./components/BannersAdsTop";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await prisma.setting.findFirst({
      include: {
        logoImage: true,
        faviconImage: true,
      },
    });
  } catch (e) {
    console.error("Error fetching settings for metadata:", e);
  }

  const title = settings?.siteName || "Express Nepal";
  const description = settings?.siteDescription || "Local Breaking news, business, weather, and things to do in Nepal";
  const faviconUrl = settings?.faviconImage?.url || "/logo.png";
  const logoUrl = settings?.logoImage?.url || "/logo.png";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.expressnepal.com";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${title} - ताजा समाचार, विचार र विश्लेषण`,
      template: `%s | ${title}`,
    },
    description,
    keywords: [
      title,
      "Nepali News",
      "ताजा समाचार",
      "नेपाल समाचार",
      "Breaking News Nepal",
      "Politics Nepal",
      "Nepal Economy",
      "Online Khabar Nepal",
    ],
    authors: [{ name: title }],
    creator: title,
    publisher: title,
    icons: {
      icon: faviconUrl,
      apple: faviconUrl,
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: "website",
      locale: "ne_NP",
      url: baseUrl,
      siteName: title,
      title: `${title} - ताजा समाचार र विचार`,
      description,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ताजा समाचार र विचार`,
      description,
      images: [logoUrl],
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
}

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
});

const mukta = Mukta({
    subsets: ["devanagari", "latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-mukta",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
    subsets: ["devanagari", "latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-noto-serif-devanagari",
});

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Detect admin routes to hide public site chrome
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/login");

    return (
        <html lang="en">
        <body
          className={`${poppins.variable} ${mukta.variable} ${notoSerifDevanagari.variable} antialiased bg-white text-black`}
        >
          {isAdmin ? (
            // Admin routes: no public header/footer
            children
          ) : (
            // Public routes: full site chrome
            <MobileMenuProvider>
              <Header />
              <main className="pt-24 sm:pt-28 lg:pt-54 min-h-screen">
                {children}
              </main>
              <Footer />
            </MobileMenuProvider>
          )}
        </body>
        </html>
    );
}
