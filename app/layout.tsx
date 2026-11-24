import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CareConnectProvider } from "@/context/useCareConnect";
import GoogleTranslateScript from "@/components/GoogleTranslateScript";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Domic Care | Family Care & Professional Caregiver Marketplace",
  description: "Find trusted, background-checked, and professional caregivers near you for family care, nursing, daily assistance, and companionship.",
  icons: {
    icon: "/domic_care_logo_without_text-removebg-preview.png",
    shortcut: "/domic_care_logo_without_text-removebg-preview.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Domic Care | Family Care & Professional Caregiver Marketplace",
    description: "Find trusted, background-checked, and professional caregivers near you for family care, nursing, daily assistance, and companionship.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DomicCare Platform" }],
  },
  verification: {
    google: "19KRYyqvfNEcQwN3bMB6_ocZstlCHrWnYGusIUcAJkY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="19KRYyqvfNEcQwN3bMB6_ocZstlCHrWnYGusIUcAJkY" />
        <link rel="icon" href="/domic_care_logo_without_text-removebg-preview.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/domic_care_logo_without_text-removebg-preview.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200"
      >
        <CareConnectProvider>
          {children}
        </CareConnectProvider>
        <GoogleTranslateScript />
      </body>
    </html>
  );
}
