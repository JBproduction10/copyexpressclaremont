// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import Providers from "@/providers/providers";
import { SessionProvider } from "@/providers/SessionProvider";

const interFont = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://copyexpressclaremont.com'), // Replace with your actual domain
  title: {
    default: "CopyExpress Claremont | Professional Printing Services in Cape Town",
    template: "%s | CopyExpress Claremont"
  },
  description: "Professional printing services in Claremont, Cape Town. From lamination to custom apparel, business cards to large format printing. Quality printing solutions for all your needs.",
  keywords: [
    "printing services Cape Town",
    "Claremont printing",
    "lamination services",
    "custom t-shirt printing",
    "business cards Cape Town",
    "copy shop Claremont",
    "digital printing",
    "large format printing",
    "document printing",
    "professional printing"
  ],
  authors: [{ name: "CopyExpress Claremont" }],
  creator: "CopyExpress Claremont",
  publisher: "CopyExpress Claremont",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://copyexpressclaremont.com",
    siteName: "CopyExpress Claremont",
    title: "CopyExpress Claremont | Professional Printing Services",
    description: "Your one-stop print shop for everything from lamination to custom apparel in Claremont, Cape Town.",
    images: [
      {
        url: "/og-image.jpg", // Add this image to your public folder
        width: 1200,
        height: 630,
        alt: "CopyExpress Claremont Printing Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CopyExpress Claremont | Professional Printing Services",
    description: "Professional printing services in Claremont, Cape Town. Quality printing solutions for all your needs.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO meta tags */}
        <link rel="canonical" href="https://copyexpressclaremont.com" />
        <meta name="geo.region" content="ZA-WC" />
        <meta name="geo.placename" content="Claremont, Cape Town" />
        <meta name="geo.position" content="-33.9833;18.4647" />
        <meta name="ICBM" content="-33.9833, 18.4647" />

        {/* 🔥 logo / favicon icons here */}
        <link rel="icon" href="/favicon.io" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-96x96" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest" />
      </head>
      <body 
        className={`${interFont.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <Providers>
            {children}
            <StructuredData/>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}