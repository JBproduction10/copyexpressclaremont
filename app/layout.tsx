// Next.js
import type { Metadata } from "next";
import { Inter, Barlow } from "next/font/google";

// Global CSS
import "./globals.css";

// Fonts
const interFont = Inter({ subsets: ["latin"] });
const barlowFont = Barlow({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-barlow",
});

// Components
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Provider wrapper (CLIENT COMPONENT)
import Providers from "@/providers/providers";

export const metadata: Metadata = {
  title: "CopyExpress Claremont",
  authors: [{ name: "CopyExpress Claremont" }],
  description: "Your trusted printing partner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${interFont.className} ${barlowFont.variable} antialiased`}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
