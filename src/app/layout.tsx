import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InfluencerLayoutContent from "./InfluencerLayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decume Influencer | Dashboard",
  description: "Decume Influencer Dashboard — Manage your storefront, sections, and earnings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
      >
        <InfluencerLayoutContent>{children}</InfluencerLayoutContent>
      </body>
    </html>
  );
}
