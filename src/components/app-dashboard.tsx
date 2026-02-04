"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TradeHistory } from "@/components/trade-history"
import { MarketNews } from "@/components/dashboard/market-news"
import { EquityChart } from "@/components/dashboard/equity-chart"
import { PnlCalendar } from "@/components/dashboard/pnl-calendar"
import { DashboardOverview } from "@/components/dashboard-overview"
// 1. IMPORT THE DOWNLOADER COMPONENT
import { ReportDownloader } from "@/components/dashboard/report-downloader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, List, Plus, LineChart, Calendar as CalendarIcon, Newspaper, ArrowUp } from "lucide-react"

interface AppDashboardProps {
    trades: any[]
}

export function AppDashboard({ trades }: AppDashboardProps) {
    const [activeTab, setActiveTab] = useState<"home" | "analytics" | "calendar" | "journal">("home")
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [focusDate, setFocusDate] = useState<Date | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) setShowScrollTop(true)
            else setShowScrollTop(false)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="w-full max-w-7xl px-4 md:px-8 pt-6 pb-28 md:pb-10 relative">

            {/* DESKTOP VIEW */}
            <div className="hidden md:block space-y-6">

                <Tabs defaultValue="overview" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                            <p className="text-muted-foreground">
                                Track your performance and analyze your edge.
                            </p>
                        </div>

                        {/* 2. UPDATED HEADER ACTIONS */}
                        <div className="flex items-center gap-3">
                            {/* Export Button added here */}
                            <ReportDownloader trades={trades} />

                            <TabsList>
                                <TabsTrigger value="overview" className="flex items-center gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="flex items-center gap-2">
                                    <LineChart className="h-4 w-4" />
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="news" className="flex items-center gap-2">
                                    <Newspaper className="h-4 w-4" />
                                    News
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">

                        {/* 50/50 SPLIT CONTAINER */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* LEFT COLUMN */}
                            <div className="space-y-4">

                                {/* 1. Overview Stats */}
                                <div>
                                    <DashboardOverview trades={trades} />
                                </div>

                                <div className="h-[1px] w-full bg-border/40" />

                                {/* 2. Trade Logs */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Recent Executions</h3>
                                    {/* FIX: Reduced height to h-[320px] to prevent scroll */}
                                    <div className="bg-card rounded-xl border shadow-sm p-0 overflow-hidden h-[320px]">
                                        <TradeHistory
                                            trades={trades}
                                            focusDate={focusDate}
                                            onClearFocus={() => setFocusDate(null)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Calendar */}
                            <div className="space-y-4 flex flex-col h-full">
                                <h3 className="font-semibold text-lg">P/L Calendar</h3>
                                {/* flex-1 ensures it fills the height of the left column */}
                                <div className="bg-card rounded-xl border shadow-sm p-6 flex-1 flex flex-col">
                                    <PnlCalendar
                                        trades={trades}
                                        selectedDate={focusDate}
                                        onSelectDate={setFocusDate}
                                    />
                                </div>
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4 animate-in fade-in-50 duration-500">
                        <EquityChart trades={trades} />
                    </TabsContent>

                    <TabsContent value="news" className="space-y-4 animate-in fade-in-50 duration-500">
                        <div className="bg-card rounded-xl border shadow-sm p-6">
                            <MarketNews />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* MOBILE VIEW */}
            <div className="md:hidden space-y-6">
                {activeTab === "home" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                                <p className="text-sm text-muted-foreground">Market Snapshot</p>
                            </div>
                            {/* Optional: Add Export to Mobile Header too */}
                            <ReportDownloader trades={trades} />
                        </div>
                        <DashboardOverview trades={trades} />
                        <div className="pt-2">
                            <MarketNews />
                        </div>
                    </div>
                )}

                {/* ... (Rest of Mobile Tabs remain the same) ... */}

                {activeTab === "analytics" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        <EquityChart trades={trades} />
                    </div>
                )}
                {activeTab === "calendar" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        <div className="pb-10">
                            <PnlCalendar trades={trades} />
                        </div>
                    </div>
                )}
                {activeTab === "journal" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="pb-10">
                            <TradeHistory trades={trades} />
                        </div>
                    </div>
                )}
            </div>

            {/* Scroll To Top & Mobile Nav (Unchanged) */}
            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    size="icon"
                    className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-primary/90 hover:bg-primary transition-all duration-300 animate-in fade-in zoom-in"
                >
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}

            <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-lg p-1 md:hidden z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center px-2 h-16">
                    <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "home" ? "text-green-600" : "text-muted-foreground"}`}>
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Home</span>
                    </button>
                    <button onClick={() => setActiveTab("analytics")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "analytics" ? "text-green-600" : "text-muted-foreground"}`}>
                        <LineChart className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Chart</span>
                    </button>
                    <div className="-mt-8">
                        <Link href="/add" className="md:hidden">
                            <Button size="icon" className="h-14 w-14 rounded-full shadow-xl border-4 border-background bg-green-600 hover:bg-green-700 text-white">
                                <Plus className="h-7 w-7" />
                            </Button>
                        </Link>
                    </div>
                    <button onClick={() => setActiveTab("calendar")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "calendar" ? "text-green-600" : "text-muted-foreground"}`}>
                        <CalendarIcon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Cal</span>
                    </button>
                    <button onClick={() => setActiveTab("journal")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "journal" ? "text-green-600" : "text-muted-foreground"}`}>
                        <List className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Logs</span>
                    </button>
                </div>
            </div>
        </div>
    )
}