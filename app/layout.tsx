import type { Metadata } from "next";
import "./globals.css";
import { CareConnectProvider } from "@/context/useCareConnect";

export const metadata: Metadata = {
  title: "Domic Care | Family Care & Professional Caregiver Marketplace",
  description: "Find trusted, background-checked, and professional caregivers near you for family care, nursing, daily assistance, and companionship.",
  icons: {
    icon: "/domic_care_logo_without_text-removebg-preview.png",
    shortcut: "/domic_care_logo_without_text-removebg-preview.png",
    apple: "/domic_care_logo_without_text-removebg-preview.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/domic_care_logo_without_text-removebg-preview.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/domic_care_logo_without_text-removebg-preview.png" type="image/png" />
        <link rel="apple-touch-icon" href="/domic_care_logo_without_text-removebg-preview.png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
        <CareConnectProvider>
          {children}
        </CareConnectProvider>
      </body>
    </html>
  );
}
