import type { Metadata } from "next";
import "./globals.css";
import { CareConnectProvider } from "@/context/useCareConnect";

export const metadata: Metadata = {
  title: "Domic Care | Premium Elderly Caregiver Marketplace",
  description: "Find trusted, background-checked, and professional caregivers near you for elderly care, nursing, daily assistance, and companionship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
        <CareConnectProvider>
          {children}
        </CareConnectProvider>
      </body>
    </html>
  );
}
