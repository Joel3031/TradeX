import { Calculator, Calendar, LineChart, Table, Bot, FileSpreadsheet } from "lucide-react"

export function FeaturesSection() {
  const mainFeatures = [
    {
      icon: Calculator,
      title: "Gross vs. Net P&L Engine",
      description: "Toggle seamlessly between gross trading performance and true net P&L after accounting for brokerage fees, exchange charges, and taxes.",
      badge: "Real-World Accounting"
    },
    {
      icon: Calendar,
      title: "Calendar Performance Heatmap",
      description: "Visualize winning and losing days at a glance with color-coded calendar blocks, monthly net P&L metrics, and daily trade counts.",
      badge: "Visual Discipline"
    },
    {
      icon: LineChart,
      title: "Cumulative Equity Curve",
      description: "Chart your account growth over custom date ranges to identify drawdowns, evaluate recovery speeds, and verify strategy expectancy.",
      badge: "Growth Tracking"
    },
    {
      icon: Table,
      title: "Granular Trade History & Logs",
      description: "Filter, search, and review historical trades with entry price, exit price, stop loss, fees, position sizing, and setup notes.",
      badge: "Complete Audit Trail"
    },
    {
      icon: Bot,
      title: "AI Strategy Co-pilot",
      description: "Ask objective questions about your trade logs, audit risk habits, analyze win rate trends, and catch emotional mistakes early.",
      badge: "AI Intelligence"
    },
    {
      icon: FileSpreadsheet,
      title: "CSV Import & PDF Audits",
      description: "Import trade executions directly from CSV/Excel spreadsheets or export formatted PDF reports for performance auditing.",
      badge: "Data Ownership"
    }
  ]

  return (
    <section id="features" className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Core Platform Features
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything you need to analyze and improve your trading
          </p>
          <p className="text-base text-zinc-400">
            Built from real trader requirements. Every tool in TradeX is designed to deliver empirical feedback on your process.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mainFeatures.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <div 
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {feat.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
