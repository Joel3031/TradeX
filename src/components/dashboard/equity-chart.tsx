"use client"

import { useMemo, useState } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts"
import { format, subMonths, subYears, isAfter } from "date-fns"
import { cn } from "@/lib/utils"

interface EquityChartProps {
    trades: any[]
}

type TimeRange = "1M" | "1Y" | "ALL"

export function EquityChart({ trades }: EquityChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>("ALL")

    const { chartData, totalPnl, winRate, isProfitable } = useMemo(() => {
        const now = new Date()
        let cutoffDate: Date | null = null

        if (timeRange === "1M") cutoffDate = subMonths(now, 1)
        if (timeRange === "1Y") cutoffDate = subYears(now, 1)

        // 1. FILTER & SORT
        const sortedTrades = trades
            .filter(t => {
                // FALLBACK: If date is missing, treat as invalid/skip or use current date
                const dateVal = t.date || t.entryDate
                if (!dateVal) return false

                if (!cutoffDate) return true
                return isAfter(new Date(dateVal), cutoffDate)
            })
            .sort((a, b) => {
                // FIX: Fallback to 0 to prevent 'undefined' error in new Date()
                const dateA = new Date(a.date || a.entryDate || 0).getTime()
                const dateB = new Date(b.date || b.entryDate || 0).getTime()
                return dateA - dateB
            })

        // 2. CALCULATE EQUITY CURVE
        let runningTotal = 0
        let wins = 0

        const data = sortedTrades.map(trade => {
            const pnl = Number(trade.pnl) || 0
            if (pnl > 0) wins++
            runningTotal += pnl

            return {
                // FIX: Ensure dateStr is always a string. If missing, use current time.
                dateStr: trade.date || trade.entryDate || new Date().toISOString(),
                dailyPnl: pnl,
                equity: runningTotal
            }
        })

        const periodTotal = data.length > 0 ? data[data.length - 1].equity : 0
        const rate = sortedTrades.length > 0 ? (wins / sortedTrades.length) * 100 : 0

        return {
            chartData: data,
            totalPnl: periodTotal,
            winRate: rate,
            isProfitable: periodTotal >= 0
        }
    }, [trades, timeRange])

    const formatXAxis = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return ""
        return timeRange === "1M" ? format(date, "MMM dd") : format(date, "MMM")
    }

    const formatYAxis = (value: number) => {
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`
        return `${value}`
    }

    const chartColor = isProfitable ? "#10b981" : "#ef4444"

    if (trades.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center border border-dashed rounded-lg bg-muted/10">
                <div className="text-center text-muted-foreground">
                    <p>No trade data available</p>
                    <p className="text-xs">Log your first trade to see the stats.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col h-full bg-card rounded-xl border shadow-sm p-6">
            <div className="pb-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {timeRange === 'ALL' ? 'Total Account Growth' : `Growth (${timeRange})`}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <h2 className={cn(
                                "text-3xl font-bold tracking-tight",
                                isProfitable ? "text-emerald-500" : "text-red-500"
                            )}>
                                {totalPnl < 0 ? "-" : ""}₹{Math.abs(totalPnl).toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {chartData.length} Trades
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {winRate.toFixed(0)}% Win Rate
                            </span>
                        </div>
                    </div>

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

            <div className="h-[300px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/10" />
                        <ReferenceLine y={0} stroke="currentColor" className="text-muted-foreground/30" />

                        <XAxis
                            dataKey="dateStr"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }}
                            tickFormatter={formatXAxis}
                            className="text-muted-foreground"
                            dy={10}
                            minTickGap={40}
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload

                                    // FIX: Ensure label exists before formatting. Fallback to empty string or current date.
                                    // We use (label || "") to satisfy TypeScript, though practically it's always a string here.
                                    const dateObj = new Date(label || new Date())
                                    const dateLabel = !isNaN(dateObj.getTime()) ? format(dateObj, "MMM dd, yyyy") : "N/A"

                                    const isPos = data.equity >= 0

                                    return (
                                        <div className="bg-popover/95 backdrop-blur-sm text-popover-foreground text-xs rounded-lg py-2 px-3 shadow-xl border border-border">
                                            <div className="text-muted-foreground mb-1 border-b pb-1">
                                                {dateLabel}
                                            </div>
                                            <div className="space-y-1 pt-1">
                                                <div className="flex justify-between gap-4">
                                                    <span>Daily P&L:</span>
                                                    <span className={data.dailyPnl >= 0 ? "text-emerald-500" : "text-red-500"}>
                                                        {data.dailyPnl >= 0 ? "+" : ""}₹{data.dailyPnl.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-4 font-bold">
                                                    <span>Total Equity:</span>
                                                    <span style={{ color: chartColor }}>
                                                        {isPos ? "+" : ""}₹{data.equity.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="equity"
                            stroke={chartColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEquity)"
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}