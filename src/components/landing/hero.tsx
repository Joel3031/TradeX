"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, ShieldCheck, TrendingUp, Sparkles, Smartphone, CheckCircle2 } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { PWAInstallModal } from "./pwa-install-modal"

interface HeroProps {
  isAuthenticated?: boolean
}

export function Hero({ isAuthenticated }: HeroProps) {
  const { isInstalled, isIOS, showModal, setShowModal, triggerInstall } = usePWAInstall()

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-zinc-950 text-zinc-100">
      {/* BACKGROUND EMERALD GLOW ACCENT */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-900/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HERO HEADER & BADGE */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Trading Journal & Performance Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Track your trades. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Understand your performance.
            </span> <br />
            Refine your strategy.
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            TradeX is built for Intraday, Options, and Delivery traders. Log executions, evaluate true net P&L after taxes and brokerage, analyze monthly calendar heatmaps, and build a disciplined trading process.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm px-7 py-6 shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02]"
              >
                <Link href="/app" className="flex items-center gap-2">
                  <span>Open Application Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm px-7 py-6 shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02]"
              >
                <Link href="/login" className="flex items-center gap-2">
                  <span>Start Journaling Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {!isInstalled && (
              <Button
                size="lg"
                variant="outline"
                onClick={triggerInstall}
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 font-medium rounded-xl text-sm px-6 py-6 transition-all"
              >
                <Download className="h-4 w-4 text-emerald-400 mr-2" />
                <span>Install as Web App</span>
              </Button>
            )}
          </div>

          {/* KEY TRUST BULLETS */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 pt-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Intraday, Options & Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Net P&L After Tax & Fees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>P/L Calendar Heatmaps</span>
            </div>
          </div>
        </div>

        {/* HERO APP SCREENSHOT SHOWCASE */}
        <div className="mt-14 lg:mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl p-2 sm:p-3 overflow-hidden group">
            
            {/* WINDOW BAR HEADER */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 mb-2 bg-zinc-950/60 rounded-t-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>tradex.app / dashboard</span>
              </div>
              <div className="w-12" />
            </div>

            {/* SCREENSHOT IMAGE */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-zinc-800/60">
              <Image
                src="/app-scrn-shot/TradeX Desktop Dashboard.png"
                alt="TradeX Application Dashboard Overview"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
              />
            </div>
          </div>
        </div>

      </div>

      <PWAInstallModal
        open={showModal}
        onOpenChange={setShowModal}
        isIOS={isIOS}
      />
    </section>
  )
}
