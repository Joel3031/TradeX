import { ClipboardCheck, Calculator, CalendarDays, Bot } from "lucide-react"

export function SolutionSection() {
  const solutions = [
    {
      icon: ClipboardCheck,
      title: "Structured Execution Logging",
      description: "Record trade entry, exit, stop-loss, position size, fees, and strategy notes in seconds."
    },
    {
      icon: Calculator,
      title: "Automated Net P&L Engine",
      description: "Instantly see true net performance after statutory taxes and brokerage charges are deducted."
    },
    {
      icon: CalendarDays,
      title: "Visual P/L Calendar",
      description: "Color-coded daily heatmap calendar revealing your win streaks, loss days, and monthly totals."
    },
    {
      icon: Bot,
      title: "AI Co-pilot Analysis",
      description: "Query your trade history to uncover hidden risk habits, win rate trends, and execution feedback."
    }
  ]

  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            The TradeX Solution
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Transform raw trade logs into a disciplined edge
          </p>
          <p className="text-base text-zinc-400">
            TradeX provides a dedicated framework to audit every execution, evaluate true net profitability, and build long-term consistency.
          </p>
        </div>

        {/* SOLUTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-emerald-500/40 transition-all space-y-4 group"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {sol.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {sol.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
