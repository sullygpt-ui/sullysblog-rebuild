import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Logo } from "@/components/ui/Logo";
import { HeaderBackground } from "@/components/layout/HeaderBackground";
import { HeaderTagline } from "@/components/layout/HeaderTagline";
import { AdZone } from "@/components/ads/AdZone";
import { MobileNav } from "@/components/layout/MobileNav";
import { FooterNav } from "@/components/layout/FooterNav";
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-64FBS1RLFD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-64FBS1RLFD');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-950`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                // Default to dark mode unless explicitly set to light
                if (theme !== 'light') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
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
              <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center gap-6">
                  {/* Navigation Links */}
                  <FooterNav />
                  {/* Social Icons */}
                  <div className="flex items-center gap-4">
                    <a
                      href="https://x.com/Sullys_Blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Follow on X"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/mike-sullivan-7a1204396/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Connect on LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                  {/* Copyright */}
                  <div className="text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} SullysBlog.com - All rights reserved</p>
                  </div>
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
