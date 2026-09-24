import type { Metadata } from "next"
import { auth } from "@/auth"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { TradingStylesSection } from "@/components/landing/trading-styles-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ScreenshotsSection } from "@/components/landing/screenshots-section"
import { PWAInstallSection } from "@/components/landing/pwa-install-section"
import { WhyJournalSection } from "@/components/landing/why-journal-section"
import { AnalyticsShowcaseSection } from "@/components/landing/analytics-showcase-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "TradeX — Professional Trading Journal & Performance Analytics",
  description: "Log intraday, options, and positional trades. Analyze win rate, net P&L after fees & taxes, monthly calendar heatmaps, and equity growth with TradeX.",
  keywords: ["trading journal", "trading analytics", "options trading journal", "intraday trade tracker", "net pnl calendar", "equity curve analyzer", "TradeX"],
  authors: [{ name: "TradeX Inc." }],
  creator: "TradeX Inc.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tradex.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TradeX — Professional Trading Journal & Performance Analytics",
    description: "Track your trades. Understand your performance. Refine your strategy. Built for intraday, options, and positional traders.",
    url: "/",
    siteName: "TradeX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TradeX Trading Journal & Performance Analytics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeX — Professional Trading Journal & Performance Analytics",
    description: "Log intraday, options, and positional trades. Analyze win rate, net P&L after fees & taxes, and calendar heatmaps.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function LandingPage() {
  const session = await auth()
  const isAuthenticated = !!session?.user

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TradeX",
    "operatingSystem": "All",
    "applicationCategory": "FinanceApplication",
    "description": "Professional trading journal and performance analytics platform for intraday, options, and positional traders.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header isAuthenticated={isAuthenticated} />
      <main>
        <Hero isAuthenticated={isAuthenticated} />
        <ProblemSection />
        <SolutionSection />
        <TradingStylesSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ScreenshotsSection />
        <PWAInstallSection />
        <WhyJournalSection />
        <AnalyticsShowcaseSection />
        <CTASection isAuthenticated={isAuthenticated} />
      </main>
      <Footer />
    </div>
  )
}