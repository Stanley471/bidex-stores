import { Suspense } from 'react';
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { getAuthCookie } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/jwt";
import { authService } from "@/services/auth.service";
import { storeSettingsService } from "@/services/store-settings.service";
import { WishlistProvider } from '@/context/WishlistProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/context/CartProvider';
import { CheckoutProvider } from '@/context/CheckoutProvider';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { NavigationOverlay } from '@/components/layout/NavigationOverlay';
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CTools Store — Quality Tools & Accessories",
    template: "%s | CTools Store",
  },
  description: "Browse and buy quality tools, machinery, and equipment with fast delivery and secure payments.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser = null;
  try {
    const cookieStore = await cookies();
    const token = getAuthCookie(cookieStore);
    if (token) {
      const payload = await verifyToken(token);
      initialUser = await authService.getCurrentUser(String(payload.sub));
    }
  } catch {
    initialUser = null;
  }

  let initialSettings: {
    storeName: string
    logo: string | null
    isStoreActive: boolean
    primaryColor: string
    secondaryColor: string
  } = {
    storeName: "CTools Store",
    logo: null,
    isStoreActive: true,
    primaryColor: "#F68B1E",
    secondaryColor: "#FF6600",
  };

  try {
    const publicSettings = await storeSettingsService.getPublicStoreSettings();
    initialSettings = {
      storeName: publicSettings.storeName,
      logo: publicSettings.logo,
      isStoreActive: publicSettings.isStoreActive,
      primaryColor: publicSettings.primaryColor || "#F68B1E",
      secondaryColor: publicSettings.secondaryColor || "#FF6600",
    };
  } catch {
    // Retain defaults
  }

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
      style={{
        '--brand-primary': initialSettings.primaryColor,
        '--brand-secondary': initialSettings.secondaryColor,
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <WishlistProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <NavigationOverlay />
            </Suspense>
            <AppHeader initialUser={initialUser} initialSettings={initialSettings} />
            <CheckoutProvider>
              <main className="flex-1 w-full">{children}</main>
              <CartDrawer />
            </CheckoutProvider>
            <AppFooter />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
