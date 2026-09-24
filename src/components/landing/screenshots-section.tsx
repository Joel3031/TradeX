"use client"

import { useState } from "react"
import Image from "next/image"
import { appScreenshots, AppScreenshot } from "@/lib/app-screenshots"
import { Monitor, Smartphone, Sparkles, CheckCircle2, Shield } from "lucide-react"

export function ScreenshotsSection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "desktop" | "mobile">("all")
  const [activeScreenshot, setActiveScreenshot] = useState<AppScreenshot>(appScreenshots[0])

  const filteredScreenshots = appScreenshots.filter(item => {
    if (activeCategory === "all") return true
    return item.category === activeCategory
  })

  return (
    <section id="showcase" className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Product Showcase</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Designed for clarity on every device
          </h2>
          <p className="text-base text-zinc-400">
            Explore actual screenshots from the TradeX desktop and mobile applications.
          </p>

          {/* FILTER BUTTONS */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              All Screenshots ({appScreenshots.length})
            </button>
            <button
              onClick={() => setActiveCategory("desktop")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeCategory === "desktop"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setActiveCategory("mobile")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeCategory === "mobile"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* ACTIVE FEATURE HIGHLIGHT DISPLAY */}
        <div className="mb-14 max-w-5xl mx-auto">
          <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                    {activeScreenshot.badge}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">
                    {activeScreenshot.category} view
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeScreenshot.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                {activeScreenshot.description}
              </p>
            </div>

            {/* SCREENSHOT CONTAINER FRAME */}
            {activeScreenshot.category === "desktop" ? (
              /* DESKTOP BROWSER FRAME */
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-400" />
                    <span>TradeX Desktop App</span>
                  </div>
                  <div className="w-12" />
                </div>
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={activeScreenshot.src}
                    alt={activeScreenshot.title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1200px) 100vw, 1100px"
                  />
                </div>
              </div>
            ) : (
              /* MOBILE PHONE FRAME */
              <div className="flex justify-center py-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <div className="relative w-full max-w-[320px] aspect-[9/18] rounded-[2.5rem] bg-zinc-900 border-[6px] border-zinc-800 shadow-2xl overflow-hidden">
                  {/* PHONE NOTCH */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-800 rounded-b-xl z-20" />
                  <Image
                    src={activeScreenshot.src}
                    alt={activeScreenshot.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* THUMBNAILS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {filteredScreenshots.map((item) => {
            const isSelected = item.id === activeScreenshot.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreenshot(item)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-zinc-900 border-emerald-500 ring-1 ring-emerald-500/50"
                    : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-2 bg-zinc-950 border border-zinc-800">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover object-top"
                    sizes="250px"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block">
                    {item.badge}
                  </span>
                  <p className="text-xs font-medium text-white truncate">
                    {item.title}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </section>
  )
}
