"use client"

import { useState, useMemo } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    getDay,
    isToday
} from "date-fns"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PnlCalendarProps {
    trades: any[]
    selectedDate?: Date | null
    onSelectDate?: (date: Date | null) => void
}

export function PnlCalendar({ trades, selectedDate, onSelectDate }: PnlCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(null)

    const activeDate = selectedDate !== undefined ? selectedDate : localSelectedDate
    const handleDateSelect = onSelectDate || setLocalSelectedDate

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const startDayIndex = getDay(monthStart)

    const dailyData = useMemo(() => {
        const data: Record<string, { pnl: number, trades: any[] }> = {}
        let maxWin = 0
        let maxLoss = 0

        trades.forEach(t => {
            const dateStr = new Date(t.date || t.entryDate).toDateString()
            if (!data[dateStr]) {
                data[dateStr] = { pnl: 0, trades: [] }
            }
            const pnl = Number(t.pnl) || 0
            data[dateStr].pnl += pnl
            data[dateStr].trades.push(t)
        })

        Object.values(data).forEach(day => {
            if (day.pnl > 0 && day.pnl > maxWin) maxWin = day.pnl
            if (day.pnl < 0 && day.pnl < maxLoss) maxLoss = day.pnl
        })

        return { map: data, maxWin, maxLoss }
    }, [trades])

    const getDayStyle = (date: Date) => {
        const dateStr = date.toDateString()
        const dayData = dailyData.map[dateStr]

        if (!dayData || dayData.pnl === 0) return {}

        const isProfit = dayData.pnl > 0
        let intensity = 0.2
        if (isProfit && dailyData.maxWin > 0) {
            intensity = 0.2 + (0.8 * (dayData.pnl / dailyData.maxWin))
        } else if (!isProfit && dailyData.maxLoss < 0) {
            intensity = 0.2 + (0.8 * (dayData.pnl / dailyData.maxLoss))
        }

        intensity = Math.min(intensity, 1)

        return {
            backgroundColor: isProfit
                ? `rgba(34, 197, 94, ${intensity})`
                : `rgba(239, 68, 68, ${intensity})`,
            color: intensity > 0.5 ? 'white' : 'inherit'
        }
    }

    const onDateClick = (date: Date) => {
        if (activeDate && isSameDay(date, activeDate)) {
            handleDateSelect(null)
        } else {
            handleDateSelect(date)
        }
    }

    const selectedDayLogs = activeDate ? dailyData.map[activeDate.toDateString()] : null

    return (
        <div className="w-full flex flex-col h-full">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                <h2 className="text-sm font-bold md:text-base">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1 md:gap-1 mb-0 flex-1 h-full">

                {/* Weekdays - FIX: Using index 'i' as key to avoid duplicates */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="flex items-center justify-center text-[10px] font-medium text-muted-foreground h-6 md:h-auto">
                        {day}
                    </div>
                ))}

                {Array.from({ length: startDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {daysInMonth.map((date) => {
                    const dayStyle = getDayStyle(date)
                    const isSelected = activeDate && isSameDay(date, activeDate)
                    const hasData = dailyData.map[date.toDateString()]

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => onDateClick(date)}
                            style={dayStyle}
                            className={cn(
                                "relative group flex flex-col items-center justify-center rounded-md text-sm md:text-xs font-medium transition-all",
                                "aspect-square md:aspect-auto h-full w-full",
                                !hasData && "hover:bg-muted/50 text-muted-foreground/50",
                                isSelected && "ring-2 ring-primary ring-offset-2 z-10 scale-105 shadow-md",
                                isToday(date) && !hasData && "bg-muted text-foreground border border-border"
                            )}
                        >
                            <span className="relative z-10">{format(date, "d")}</span>

                            {hasData && (
                                <span className={cn(
                                    "mt-0.5 w-1 h-1 rounded-full bg-current opacity-70",
                                    dayStyle.color === 'white' ? "bg-white" : "bg-foreground"
                                )} />
                            )}

                            {/* Hover tooltip (Desktop Only) */}
                            {hasData && (
                                <div className="hidden md:group-hover:block absolute bottom-full mb-2 z-50 w-40 bg-popover text-popover-foreground rounded-lg border shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                                    <div className="flex justify-between items-center border-b pb-1 mb-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">{format(date, "MMM dd")}</span>
                                        <span className={cn("text-[10px] font-bold", hasData.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                                            {hasData.pnl >= 0 ? "+" : ""}{hasData.pnl.toFixed(0)}
                                        </span>
                                    </div>
                                    <div className="space-y-0.5">
                                        {hasData.trades.slice(0, 3).map((t, i) => (
                                            <div key={i} className="flex justify-between text-[10px]">
                                                <span className="font-medium truncate max-w-[60px]">{t.symbol}</span>
                                                <span className={Number(t.pnl) >= 0 ? "text-green-500" : "text-red-500"}>
                                                    {Number(t.pnl).toFixed(0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* MOBILE ONLY: Selected Date Logs */}
            {activeDate && (
                <div className="md:hidden animate-in slide-in-from-top-2 fade-in duration-300 border-t pt-4 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm">
                            Activity for {format(activeDate, "MMM dd, yyyy")}
                        </h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDateSelect(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    {!selectedDayLogs ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No trades recorded.</p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                                <span className="text-xs font-medium uppercase text-muted-foreground">Daily Net P/L</span>
                                <span className={cn("font-bold text-lg", selectedDayLogs.pnl >= 0 ? "text-green-600" : "text-red-600")}>
                                    {selectedDayLogs.pnl >= 0 ? "+" : ""}{selectedDayLogs.pnl.toFixed(2)}
                                </span>
                            </div>
                            <div className="divide-y divide-border/40">
                                {selectedDayLogs.trades.map((trade: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between py-3">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-sm">{trade.symbol}</span>
                                            <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm w-fit", trade.type === "BUY" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700")}>{trade.type}</span>
                                        </div>
                                        <div className={cn("font-mono font-medium text-sm", (Number(trade.pnl) || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                                            {(Number(trade.pnl) || 0) >= 0 ? "+" : ""}{(Number(trade.pnl) || 0).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}