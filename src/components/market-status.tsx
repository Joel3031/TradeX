import { getMarketData } from "@/app/actions"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export async function MarketStatus() {
    const data = await getMarketData()

    // If even the fallback fails (rare), show a simple error box
    if (!data) return <div className="text-xs text-muted-foreground">Market data unavailable</div>

    const renderTicker = (name: string, metric: any) => {
        // Handle mock/static data that might be missing 'change'
        const change = metric.change || 0
        const percent = metric.percent || 0
        const price = metric.price || 0

        const isPositive = change >= 0
        const ColorIcon = isPositive ? TrendingUp : TrendingDown
        const colorClass = isPositive ? "text-green-500" : "text-red-500"

        return (
            <div className="flex flex-col justify-center px-6 py-3 bg-card/50 border rounded-xl shadow-sm min-w-[200px] flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{name}</span>
                    <ColorIcon className={`h-4 w-4 ${colorClass}`} />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight">
                        {price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-bold ${colorClass}`}>
                        {isPositive ? "+" : ""}
                        {change.toFixed(2)} ({percent.toFixed(2)}%)
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl px-4 md:px-8 mt-2 mb-8">
            <div className="flex flex-wrap gap-4 w-full">
                {renderTicker("Nifty 50", data.nifty)}
                {renderTicker("Sensex", data.sensex)}
            </div>
        </div>
    )
}