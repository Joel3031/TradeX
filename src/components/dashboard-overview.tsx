"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from "lucide-react"

interface DashboardOverviewProps {
    trades: any[]
}

export function DashboardOverview({ trades }: DashboardOverviewProps) {
    const totalTrades = trades.length
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const netPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const isProfitable = netPnl >= 0

    return (
        <div className="w-full">

            {/* MOBILE VIEW: HERO LAYOUT */}
            <div className="md:hidden flex flex-col items-center justify-center py-8 space-y-6">
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        NET P/L
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <h1 className={`text-5xl font-bold tracking-tight ${isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {isProfitable ? "+" : ""}{netPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </h1>
                    </div>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isProfitable ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {isProfitable ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {totalTrades} Trades (All Time)
                    </div>
                </div>
                <div className="flex w-full max-w-[280px] justify-between items-center px-4 pt-2">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground font-medium mb-1">Win Rate</span>
                        <div className="flex items-center gap-1.5">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-xl font-bold">{winRate.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-border/60" />
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground font-medium mb-1">Won / Total</span>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-xl font-bold">{winningTrades}/{totalTrades}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESKTOP VIEW: COMPACT ROW FOR LEFT COLUMN */}
            <div className="hidden md:flex w-full items-center justify-around py-2">

                {/* Net P/L */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net P/L</span>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl lg:text-4xl font-bold tracking-tight ${isProfitable ? "text-green-600" : "text-red-600"}`}>
                            {isProfitable ? "+" : ""}{netPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="h-10 w-[1px] bg-border/40 mx-4" />

                {/* Win Rate */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Win Rate</span>
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl lg:text-3xl font-bold">{winRate.toFixed(1)}%</span>
                    </div>
                </div>

                <div className="h-10 w-[1px] bg-border/40 mx-4" />

                {/* Total Trades */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trades</span>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl lg:text-3xl font-bold">{totalTrades}</span>
                    </div>
                </div>

            </div>
        </div>
    )
}