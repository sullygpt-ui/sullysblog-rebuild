import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Logo } from "@/components/ui/Logo";
import { HeaderBackground } from "@/components/layout/HeaderBackground";
import { HeaderTagline } from "@/components/layout/HeaderTagline";
import { AdZone } from "@/components/ads/AdZone";
import { MobileNav } from "@/components/layout/MobileNav";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SullysBlog.com - Domain Investing Tips and News",
  description: "Domain investing, keyword premium domain names, domain tips, selling domains, generic domains",
  alternates: {
    types: {
      'application/rss+xml': 'https://sullysblog.com/rss.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-950`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header>
              {/* Logo Section - White/Dark Background */}
              <HeaderBackground>
                <div className="container mx-auto px-4 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center">
                          <Logo className="h-12 sm:h-18 w-auto" width={250} height={67} />
                        </Link>
                        {/* Dark mode toggle - mobile only (moves to right on mobile) */}
                        <div className="sm:hidden">
                          <DarkModeToggle />
                        </div>
                      </div>
                      <HeaderTagline />
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      <AdZone zone="header_banner" />
                      <DarkModeToggle />
                    </div>
                  </div>
                </div>
              </HeaderBackground>

              {/* Navigation Section - Blue Background */}
              <div
                className="text-white relative"
                style={{ backgroundColor: '#0070ba' }}
              >
                <div className="container mx-auto px-4">
                  <MobileNav />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white dark:bg-gray-900 mt-auto">
              <div className="container mx-auto px-4 py-6">
                <div className="text-center text-sm text-gray-400">
                  <p>&copy; {new Date().getFullYear()} SullysBlog.com - All rights reserved</p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
        <ScrollToTop />
      </body>
    </html>
  );
}
