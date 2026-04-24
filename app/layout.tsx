import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/providers/AppToaster";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OPPORTA — Opportunités business",
  description: "Fil d'opportunités business en temps réel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans text-[15px] leading-relaxed tracking-[-0.01em] antialiased bg-background text-foreground">
        <QueryProvider>
          {children}
          <AppToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
