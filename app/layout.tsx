// Next.js
import type { Metadata } from "next";
import { Inter} from "next/font/google";

// Global CSS
import "./globals.css";

// Fonts
const interFont = Inter({ subsets: ["latin"] });

// Provider wrapper (CLIENT COMPONENT)
import Providers from "@/providers/providers";
import { SessionProvider } from "@/providers/SessionProvider";

export const metadata: Metadata = {
  title: "CopyExpress Claremont",
  authors: [{ name: "CopyExpress Claremont" }],
  description: "Your trusted printing partner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${interFont.className} antialiased`}>
        <SessionProvider>
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
