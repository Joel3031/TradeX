import Image from "next/image"
import { TrendingUp, PieChart, Activity, ShieldCheck } from "lucide-react"

export function AnalyticsShowcaseSection() {
  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT EXPLANATION */}
          <div className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Analytical Feedback
            </h2>

            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Turn execution data into intuitive visual insights
            </h3>

            <p className="text-base text-zinc-400 leading-relaxed">
              Instead of sifting through thousands of raw rows, TradeX distills your trading journey into actionable charts, monthly calendar heatmaps, win rate percentages, and net equity curves.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Net Equity Curve Tracking</h4>
                  <p className="text-xs text-zinc-400">Visualize overall account performance trajectories over customizable time ranges.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Win Rate & Trade Count Analytics</h4>
                  <p className="text-xs text-zinc-400">Monitor win rates, trade volume, gross P&L, and net P&L after fee deductions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Execution Feed & Details</h4>
                  <p className="text-xs text-zinc-400">Quickly review entry/exit timestamps, fees, and stop-loss targets for recent trades.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SCREENSHOT CONTAINER */}
          <div className="relative">
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl p-3 overflow-hidden group">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/70 rounded-t-xl border-b border-zinc-800 mb-2 text-[11px] font-mono text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>Equity & Analytics View</span>
                </div>
                <div className="w-12" />
              </div>

              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-zinc-800/80">
                <Image
                  src="/app-scrn-shot/TradeX Desktop Chart.png"
                  alt="TradeX Analytics and Equity Chart View"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
                  sizes="(max-width: 1200px) 100vw, 600px"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
