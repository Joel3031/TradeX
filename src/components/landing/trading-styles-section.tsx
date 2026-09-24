import { Zap, Layers, Clock, CheckCircle2 } from "lucide-react"

export function TradingStylesSection() {
  const styles = [
    {
      icon: Zap,
      badge: "Fast-Paced",
      title: "Intraday Trading",
      subtitle: "Log fast-paced scalp and day trades with precision timestamps and fee calculation.",
      points: [
        "Record entry/exit timestamps & slippage",
        "Track gross P&L vs net P&L per execution",
        "Deduct brokerage & turnover charges",
        "Evaluate intraday win rate & risk-reward ratio"
      ]
    },
    {
      icon: Layers,
      badge: "Derivatives",
      title: "Options Trading",
      subtitle: "Full support for index & stock option buyers and sellers.",
      points: [
        "Categorize Calls (CE) & Puts (PE)",
        "Track strike selection & contract expiry",
        "Log premium paid vs premium received",
        "Attach setup rationale & strategy notes"
      ]
    },
    {
      icon: Clock,
      badge: "Multi-Day Holds",
      title: "Delivery / Positional Trades",
      subtitle: "Monitor swing setups, trend following, and multi-week equity holds.",
      points: [
        "Track holding duration across days and weeks",
        "Monitor trailing stop-loss execution",
        "Analyze swing trade equity curves over time",
        "Audit trade rules vs emotional early exits"
      ]
    }
  ]

  return (
    <section id="trade-types" className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Supported Trading Styles
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Purpose-built for how you actually trade
          </p>
          <p className="text-base text-zinc-400">
            Whether you trade quick intraday momentum, complex option strategies, or positional swing setups, TradeX accommodates your specific execution workflow.
          </p>
        </div>

        {/* 3 STYLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {styles.map((style, idx) => {
            const Icon = style.icon
            return (
              <div 
                key={idx}
                className="p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700/60">
                      {style.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {style.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {style.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 space-y-2.5">
                    {style.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
