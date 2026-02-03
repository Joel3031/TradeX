"use client"

import { useMemo, useState } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { Button } from "@/components/ui/button"
import { format, subMonths, subYears, isAfter } from "date-fns"
import { cn } from "@/lib/utils"

interface EquityChartProps {
    trades: any[]
}

type TimeRange = "1M" | "1Y" | "ALL"

export function EquityChart({ trades }: EquityChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>("ALL")

    // 1. Process Data
    const { chartData, totalPnl, winRate } = useMemo(() => {
        const now = new Date()
        let cutoffDate: Date | null = null

        if (timeRange === "1M") cutoffDate = subMonths(now, 1)
        if (timeRange === "1Y") cutoffDate = subYears(now, 1)

        const filteredTrades = trades
            .filter(t => {
                if (!cutoffDate) return true
                return isAfter(new Date(t.entryDate), cutoffDate)
            })
            .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())

        let runningTotal = 0
        let wins = 0
        const data = []

        // Add start point
        if (filteredTrades.length > 0) {
            data.push({
                dateStr: cutoffDate ? cutoffDate.toISOString() : filteredTrades[0].entryDate,
                dateLabel: "Start",
                pnl: 0
            })
        }

        filteredTrades.forEach(trade => {
            const pnl = Number(trade.pnl) || 0
            if (pnl > 0) wins++
            runningTotal += pnl

            data.push({
                dateStr: trade.entryDate,
                dateLabel: trade.entryDate,
                pnl: runningTotal
            })
        })

        return {
            chartData: data,
            totalPnl: runningTotal,
            winRate: filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0
        }
    }, [trades, timeRange])

    // 2. Formatters
    const formatXAxis = (dateStr: string) => {
        if (dateStr === "Start") return ""
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
                    <p className="text-xs">Log your first trade to see the curve.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col h-full">

            {/* HEADER SECTION (No Card Padding) */}
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
                                <span className="opacity-70 ml-1 text-foreground">({winRate.toFixed(0)}% Win Rate)</span>
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

            {/* CHART AREA (Transparent Container) */}
            <div className="h-[250px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isProfitable ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={isProfitable ? "#10b981" : "#ef4444"} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="currentColor"
                            className="text-muted/10"
                        />

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
                            cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.2 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    const dateLabel = data.dateStr === 'Start' ? 'Start of Period' : format(new Date(data.dateStr), "MMM dd, yyyy")
                                    return (
                                        <div className="bg-popover text-popover-foreground text-xs rounded-lg py-2 px-3 shadow-xl border border-border">
                                            <div className="text-muted-foreground mb-1">
                                                {dateLabel}
                                            </div>
                                            <div className="font-semibold text-sm">
                                                {data.pnl >= 0 ? "+" : ""}₹{data.pnl.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="pnl"
                            stroke={isProfitable ? "#10b981" : "#ef4444"}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorPnl)"
                            activeDot={{
                                r: 6,
                                fill: isProfitable ? "#10b981" : "#ef4444",
                                stroke: "var(--background)",
                                strokeWidth: 4
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}