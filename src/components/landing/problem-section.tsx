import { FileSpreadsheet, BrainCircuit, Receipt, AlertOctagon } from "lucide-react"

export function ProblemSection() {
  const problems = [
    {
      icon: FileSpreadsheet,
      title: "The Spreadsheet & Memory Trap",
      description: "Logging trades in messy Excel files or relying on memory leads to incomplete logs, lost trade setups, and zero actionable insight."
    },
    {
      icon: BrainCircuit,
      title: "Emotional & Impulsive Patterns",
      description: "Without reviewing previous entries, traders unknowingly repeat revenge trading, over-leveraging, and cutting winners too early."
    },
    {
      icon: Receipt,
      title: "Gross P&L vs. Net Reality",
      description: "Focusing solely on top-line profits hides the true cost of exchange fees, taxes, and slippage that erode actual long-term account growth."
    },
    {
      icon: AlertOctagon,
      title: "Lack of Systemic Review",
      description: "Most traders evaluate trades in isolation based on monetary outcome rather than assessing whether they followed their written strategy."
    }
  ]

  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            The Trading Challenge
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Why most traders struggle to achieve long-term consistency
          </p>
          <p className="text-base text-zinc-400">
            Trading failure rarely stems from a lack of technical setup knowledge. It stems from failing to track execution quality, manage risk, and review past behavior systematically.
          </p>
        </div>

        {/* PROBLEM CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {problems.map((prob, idx) => {
            const Icon = prob.icon
            return (
              <div 
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-4"
              >
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {prob.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {prob.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
