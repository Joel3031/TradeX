"use client"

import { useMemo, useState } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from "recharts"
import { format, subMonths, subYears, isAfter, startOfDay, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface EquityChartProps {
    trades: any[]
}

type TimeRange = "1M" | "1Y" | "ALL"

export function EquityChart({ trades }: EquityChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>("ALL")

    // 1. Process Data: Group by Day instead of Cumulative
    const { chartData, totalPnl, winRate } = useMemo(() => {
        const now = new Date()
        let cutoffDate: Date | null = null

        if (timeRange === "1M") cutoffDate = subMonths(now, 1)
        if (timeRange === "1Y") cutoffDate = subYears(now, 1)

        // Filter trades by date range
        const filteredTrades = trades.filter(t => {
            if (!cutoffDate) return true
            return isAfter(new Date(t.entryDate), cutoffDate)
        })

        // Group PnL by Date
        const dailyMap = new Map<string, number>()
        let totalWins = 0
        let periodTotal = 0

        filteredTrades.forEach(trade => {
            // Normalize date to YYYY-MM-DD to group same-day trades
            const dateKey = new Date(trade.entryDate).toISOString().split('T')[0]
            const pnl = Number(trade.pnl) || 0

            // Add to daily total
            const currentVal = dailyMap.get(dateKey) || 0
            dailyMap.set(dateKey, currentVal + pnl)

            // Calculate Period Stats
            periodTotal += pnl
            if (pnl > 0) totalWins++
        })

        // Convert Map to Array and Sort by Date
        const data = Array.from(dailyMap.entries())
            .map(([dateStr, pnl]) => ({
                dateStr,
                pnl
            }))
            .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())

        return {
            chartData: data,
            totalPnl: periodTotal,
            winRate: filteredTrades.length > 0 ? (totalWins / filteredTrades.length) * 100 : 0
        }
    }, [trades, timeRange])

    // 2. Formatters
    const formatXAxis = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return ""
        return timeRange === "1M" ? format(date, "MMM dd") : format(date, "MMM")
    }

    const formatYAxis = (value: number) => {
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`
        return `${value}`
    }

    const isProfitable = totalPnl >= 0

    if (trades.length === 0) {
        return (
            <div className="h-[250px] flex items-center justify-center border border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                    <p>No trade data available</p>
                    <p className="text-xs">Log your first trade to see the stats.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col h-full">

            {/* HEADER SECTION */}
            <div className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                    {/* Stats Display */}
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            {timeRange === 'ALL' ? 'Net P/L (All Time)' : `Net P/L (${timeRange})`}
                        </h3>

                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {totalPnl < 0 ? "-" : ""}₹{Math.abs(totalPnl).toLocaleString('en-IN')}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <span className={cn(
                                "text-sm font-medium",
                                isProfitable ? "text-emerald-500" : "text-red-500"
                            )}>
                                {isProfitable ? "+" : ""}{totalPnl.toFixed(2)}
                                <span className="opacity-70 ml-1 text-foreground">
                                    ({winRate.toFixed(0)}% Win Rate)
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Time Filter Buttons */}
                    <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50 self-start">
                        {(["1M", "1Y", "ALL"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    timeRange === range
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHART AREA - CHANGED TO BAR CHART */}
            <div className="h-[250px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="currentColor"
                            className="text-muted/10"
                        />

                        {/* Zero Line to separate Profit/Loss */}
                        <ReferenceLine y={0} stroke="currentColor" className="text-muted-foreground/20" />

                        <XAxis
                            dataKey="dateStr"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }}
                            tickFormatter={formatXAxis}
                            className="text-muted-foreground"
                            dy={10}
                            minTickGap={30}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }}
                            tickFormatter={formatYAxis}
                            className="text-muted-foreground"
                            width={45}
                        />

                        <Tooltip
                            cursor={{ fill: 'currentColor', opacity: 0.05 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    const dateLabel = format(new Date(data.dateStr), "MMM dd, yyyy")
                                    const isWin = data.pnl >= 0

                                    return (
                                        <div className="bg-popover text-popover-foreground text-xs rounded-lg py-2 px-3 shadow-xl border border-border">
                                            <div className="text-muted-foreground mb-1">
                                                {dateLabel}
                                            </div>
                                            <div className={cn(
                                                "font-semibold text-sm",
                                                isWin ? "text-emerald-500" : "text-red-500"
                                            )}>
                                                {data.pnl >= 0 ? "+" : ""}₹{data.pnl.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />

                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                                    // Add slight opacity to make it look modern
                                    fillOpacity={0.9}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}