import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
 
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isUserAuthenticated } from "@/lib/server-api";
import { buildMetadata } from "@/config/seo";
import "../globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    titleTemplate:
      locale === "ar"
        ? "%s | مركز حضرموت الحديث للكهربائيات"
        : "%s | Hadramout Modern Center for Electricals",
  });
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const isAuthenticated = await isUserAuthenticated();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={`${cairo.className} min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <Navbar isAuthenticated={isAuthenticated} />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
