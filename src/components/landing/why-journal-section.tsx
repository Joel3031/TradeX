import { CheckCircle2, Shield, Target, Compass, Sparkles } from "lucide-react"

export function WhyJournalSection() {
  const points = [
    {
      title: "Data Over Selective Memory",
      description: "Human memory naturally forgets painful losses and overvalues lucky wins. A trade journal holds an unbiased mirror to your true execution habits."
    },
    {
      title: "Uncover Your True Expectancy",
      description: "Discover which trade setups, risk-reward ratios, and holding periods yield a positive statistical expectancy over 50+ trades."
    },
    {
      title: "Enforce Behavioral Discipline",
      description: "Writing down entry triggers, stop-loss levels, and strategy tags before executing slows down impulsive emotional trades."
    },
    {
      title: "Audit Fee & Slippage Impact",
      description: "High trade frequency with small margins often burns capital in brokerage fees. Journaling reveals your actual net profit after expenses."
    }
  ]

  return (
    <section id="why-journal" className="py-20 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Trading Psychology & Process
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Why professional traders keep a journal
          </p>
          <p className="text-base text-zinc-400">
            The fundamental difference between gambling and systematic trading is continuous execution audit.
          </p>
        </div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {points.map((pt, idx) => (
            <div 
              key={idx}
              className="p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {pt.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-10">
                {pt.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
