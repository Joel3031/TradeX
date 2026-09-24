import { PenTool, BarChart3, CalendarCheck, ShieldAlert } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: PenTool,
      title: "Log Executions in Seconds",
      description: "Quickly enter trade setups on desktop or mobile with entry price, exit price, stop loss, fees, and strategy notes."
    },
    {
      num: "02",
      icon: BarChart3,
      title: "Automate Net P&L",
      description: "TradeX instantly calculates gross returns vs net P&L after accounting for brokerage fees and exchange taxes."
    },
    {
      num: "03",
      icon: CalendarCheck,
      title: "Review P/L Calendar & Win Rate",
      description: "Track monthly calendar heatmaps, daily profit/loss distributions, and cumulative account equity growth."
    },
    {
      num: "04",
      icon: ShieldAlert,
      title: "Refine Your Edge",
      description: "Use objective trade history and AI co-pilot insights to eliminate bad habits and enforce trading discipline."
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Simple 4-Step Process
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How TradeX elevates your trading process
          </p>
          <p className="text-base text-zinc-400">
            A frictionless workflow designed to take under 2 minutes per trading session.
          </p>
        </div>

        {/* 4 STEPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-all space-y-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400/80 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/50">
                    STEP {step.num}
                  </span>
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 group-hover:text-emerald-400 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">
                  {step.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
