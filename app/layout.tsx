import type { Metadata } from "next";
import { Mukta, Poppins, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { MobileMenuProvider } from "./components/MobileMenuContext";
import BannerAdsTop from "./components/BannersAdsTop";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: "Express Nepal",
    description: " Local Breaking news, business, weather, and things to do",
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
};

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
