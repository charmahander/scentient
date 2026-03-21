import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Scentient",
  description: "Your intelligent fragrance collection",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <main className="flex-1 overflow-y-auto pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
