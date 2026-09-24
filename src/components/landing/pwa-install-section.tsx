"use client"

import { Button } from "@/components/ui/button"
import { Download, Smartphone, Monitor, Zap, ShieldCheck, Share, PlusSquare } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { PWAInstallModal } from "./pwa-install-modal"

export function PWAInstallSection() {
  const { isInstalled, isIOS, showModal, setShowModal, triggerInstall } = usePWAInstall()

  return (
    <section id="install" className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 relative overflow-hidden shadow-2xl">
          {/* Subtle Emerald Background Accent */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            
            {/* LEFT CONTENT */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Smartphone className="h-3.5 w-3.5" />
                <span>Modern Web Application</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Install TradeX directly on your smartphone
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                No app store downloads required. TradeX is built as a progressive web app (PWA) that installs in seconds with standalone full-screen performance, home screen access, and instant updates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <Zap className="h-4 w-4" />
                    <span>Instant Launch</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Launches straight from your home screen without browser chrome bars.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Secure & Private</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Encrypted SSL connection with direct database session authentication.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                {!isInstalled ? (
                  <Button
                    size="lg"
                    onClick={triggerInstall}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm px-7 py-6 shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Install TradeX Web App</span>
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium w-fit flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>TradeX is already installed on this device</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PLATFORM INSTRUCTIONS CARD */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Installation Instructions</span>
              </h3>

              <div className="space-y-4">
                {/* IPHONE / SAFARI */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      iOS / Safari (iPhone & iPad)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tap Safari Share icon (<Share className="inline h-3 w-3 text-blue-400" />) then select &quot;<PlusSquare className="inline h-3 w-3 text-emerald-400" /> Add to Home Screen&quot;.
                  </p>
                </div>

                {/* ANDROID / CHROME / EDGE */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                    <span className="flex items-center gap-1.5">
                      <Monitor className="h-4 w-4 text-emerald-400" />
                      Android / Chrome / Desktop
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Click the Install button above or tap browser menu (⋮) &gt; Install app.
                  </p>
                </div>
              </div>
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
