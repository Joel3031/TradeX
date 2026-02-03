"use client"

import { useState, useMemo } from "react"
import { format, isSameMonth, isSameYear, isSameWeek, startOfWeek, endOfWeek, addMonths, subMonths, addYears, subYears, addWeeks, subWeeks, isSameDay } from "date-fns"
import { TradeDialog } from "@/components/trade-dialog" // CHANGED: Using Edit Dialog
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface TradeHistoryProps {
    trades: any[]
    focusDate?: Date | null
    onClearFocus?: () => void
}

type FilterType = "week" | "month" | "year"

export function TradeHistory({ trades, focusDate, onClearFocus }: TradeHistoryProps) {
    const [filter, setFilter] = useState<FilterType>("month")
    const [viewDate, setViewDate] = useState(new Date())

    // EDIT STATE
    const [editingTrade, setEditingTrade] = useState<any | null>(null)

    // 1. FILTER LOGIC
    const filteredTrades = useMemo(() => {
        return trades.filter((trade) => {
            const tradeDate = new Date(trade.date || trade.entryDate)

            if (focusDate) {
                return isSameDay(tradeDate, focusDate)
            }

            if (filter === "week") return isSameWeek(tradeDate, viewDate, { weekStartsOn: 1 })
            if (filter === "month") return isSameMonth(tradeDate, viewDate) && isSameYear(tradeDate, viewDate)
            if (filter === "year") return isSameYear(tradeDate, viewDate)
            return true
        })
    }, [filter, viewDate, trades, focusDate])

    const navigate = (direction: "prev" | "next") => {
        if (filter === "month") setViewDate(prev => direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1))
        else if (filter === "year") setViewDate(prev => direction === "prev" ? subYears(prev, 1) : addYears(prev, 1))
        else setViewDate(prev => direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1))
    }

    const periodLabel = useMemo(() => {
        if (focusDate) return format(focusDate, "MMMM dd, yyyy")
        if (filter === "month") return format(viewDate, "MMMM yyyy")
        if (filter === "year") return format(viewDate, "yyyy")
        const start = startOfWeek(viewDate, { weekStartsOn: 1 })
        const end = endOfWeek(viewDate, { weekStartsOn: 1 })
        return `${format(start, "MMM dd")} - ${format(end, "MMM dd")}`
    }, [filter, viewDate, focusDate])

    const periodPnl = filteredTrades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0)
    const isProfitable = periodPnl >= 0

    return (
        <div className="w-full h-full flex flex-col">

            {/* HEADER SECTION */}
            {/* UI CHANGE: Removed bg-card/border on mobile. Added md: prefixes to restore them on desktop */}
            <div className="p-0 md:p-6 md:border-b md:bg-card z-10 sticky top-0 bg-transparent">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                    {/* LEFT: Net P/L Summary */}
                    <div className="order-2 md:order-1 flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            {focusDate && onClearFocus && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClearFocus}
                                    className="h-5 w-5 -ml-1 text-foreground hover:bg-muted"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                </Button>
                            )}
                            Net P/L ({focusDate ? "Daily" : filter === 'week' ? 'Weekly' : filter === 'month' ? 'Monthly' : 'Annual'})
                        </span>
                        <div className="flex items-baseline gap-3">
                            <span className={cn(
                                "text-3xl font-bold tracking-tight",
                                isProfitable ? "text-green-600" : "text-red-600"
                            )}>
                                {isProfitable ? "+" : ""}{periodPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {filteredTrades.length} Trades
                            </span>
                        </div>
                    </div>

                    {/* RIGHT: Filters or Back Button */}
                    <div className="order-1 md:order-2 flex flex-col gap-2 w-full md:w-auto">

                        {!focusDate ? (
                            <>
                                {/* Filter Toggle */}
                                {/* UI CHANGE: bg-transparent on mobile, bg-muted/40 on desktop */}
                                <div className="flex p-1 bg-transparent md:bg-muted/40 rounded-lg w-full md:w-auto md:border md:border-border/50">
                                    {(['week', 'month', 'year'] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => { setFilter(f); setViewDate(new Date()); }}
                                            className={cn(
                                                "flex-1 md:px-3 text-[10px] md:text-xs font-medium py-1.5 rounded-md transition-all whitespace-nowrap",
                                                filter === f
                                                    // Mobile: Underline or simple bold. Desktop: Boxed
                                                    ? "text-foreground font-bold border-b-2 border-primary md:border-b-0 md:bg-background md:shadow-sm md:ring-1 md:ring-border/50"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'Year'}
                                        </button>
                                    ))}
                                </div>

                                {/* Date Navigator */}
                                <div className="flex items-center justify-between md:justify-end bg-transparent md:bg-background md:border rounded-md p-1 md:shadow-sm w-full md:w-auto gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => navigate("prev")} className="h-7 w-7 shrink-0">
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <span className="text-xs font-semibold min-w-[100px] text-center px-2 truncate">
                                        {periodLabel}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => navigate("next")} className="h-7 w-7 shrink-0">
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center bg-muted/20 border border-green-200 dark:border-green-900 rounded-md px-4 py-2">
                                <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                    {format(focusDate, "EEEE, MMM dd")}
                                </span>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* LOGS LIST */}
            <div className="flex-1 overflow-y-auto p-0 md:p-6 md:pt-0 space-y-0 divide-y divide-border/40 custom-scrollbar">
                {filteredTrades.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">No trades found</p>
                        <p className="text-xs text-muted-foreground/60">
                            No activity recorded for {periodLabel}.
                        </p>
                    </div>
                ) : (
                    filteredTrades.map((trade) => {
                        const pnl = Number(trade.pnl) || 0
                        const isWin = pnl >= 0

                        return (
                            <div
                                key={trade.id}
                                // TRIGGER EDIT ON CLICK
                                onClick={() => setEditingTrade(trade)}
                                className="flex items-center justify-between py-4 cursor-pointer hover:bg-muted/30 px-2 rounded-md transition-colors"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-base">{trade.symbol}</span>
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded-sm font-medium uppercase",
                                            trade.type === "BUY"
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                        )}>
                                            {trade.type}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(trade.date || trade.entryDate), "MMM dd, yyyy")}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <div className={cn("font-mono font-medium text-base", isWin ? "text-green-600" : "text-red-600")}>
                                        {isWin ? "+" : ""}{pnl.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        @ {Number(trade.entryPrice).toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* REPLACED: View Dialog -> Edit Dialog */}
            <TradeDialog
                open={!!editingTrade}
                onOpenChange={(open) => !open && setEditingTrade(null)}
                tradeToEdit={editingTrade}
            />
        </div>
    )
}