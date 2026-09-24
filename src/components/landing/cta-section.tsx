"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, LayoutDashboard, LogIn, Sparkles } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { PWAInstallModal } from "./pwa-install-modal"

interface CTASectionProps {
  isAuthenticated?: boolean
}

export function CTASection({ isAuthenticated }: CTASectionProps) {
  const { isInstalled, isIOS, showModal, setShowModal, triggerInstall } = usePWAInstall()

  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Elevate Your Execution</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Your trades tell a story. <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Start understanding it.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Log intraday, options, and delivery executions. Track net returns after fees, review calendar heatmaps, and audit your strategy.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm px-8 py-6 shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02]"
            >
              <Link href="/app" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Open Application Dashboard</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm px-8 py-6 shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02]"
            >
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Start Journaling Today</span>
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
              <span>Install Web App</span>
            </Button>
          )}
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
