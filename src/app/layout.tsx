import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: "Ad Genius - AI Advertising Optimization",
  description: "Optimize your social media advertising campaigns with AI-powered insights and automation. Support for Meta Ads, Google Ads, TikTok, and more.",
  keywords: ["advertising", "AI", "optimization", "Meta Ads", "Google Ads", "TikTok", "ROAS", "campaigns"],
  authors: [{ name: "Ad Genius Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Ad Genius - AI Advertising Optimization",
    description: "Optimize your social media advertising campaigns with AI-powered insights and automation.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ad Genius - AI Advertising Optimization",
    description: "Optimize your social media advertising campaigns with AI-powered insights and automation.",
  },
  other: {
    // Telegram Mini App specific meta tags
    "telegram-webapp": "true",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Telegram Web App SDK */}
        <script 
          src="https://telegram.org/js/telegram-web-app.js"
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-background text-foreground`}
      >
        {/* Telegram Mini App Auto-Authentication Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global Telegram Mini App detection and auto-auth
              (function() {
                if (typeof window !== 'undefined') {
                  const isTelegramMiniApp = 
                    window.Telegram?.WebApp ||
                    window.location.href.includes('ngrok-free.app') ||
                    window.location.href.includes('telegram') ||
                    window.location.search.includes('tg') ||
                    document.referrer.includes('t.me') ||
                    document.referrer.includes('telegram');
                  
                  if (isTelegramMiniApp && window.location.pathname === '/auth/signin') {
                    console.log('🚀 Global: Redirecting Telegram user from signin to dashboard');
                    window.location.replace('/dashboard');
                  }
                }
              })();
            `,
          }}
        />
        <AuthProvider>
          <div className="min-h-full flex flex-col">
        {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
