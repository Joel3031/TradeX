"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch" // Import the new Switch
import { TradeHistory } from "@/components/trade-history"
import { MarketNews } from "@/components/dashboard/market-news"
import { EquityChart } from "@/components/dashboard/equity-chart"
import { PnlCalendar } from "@/components/dashboard/pnl-calendar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ReportDownloader } from "@/components/dashboard/report-downloader"
import { ImportTrades } from "@/components/dashboard/import-trades"

import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, List, Plus, LineChart, Calendar as CalendarIcon, Newspaper, ArrowUp, User, Moon, LogOut } from "lucide-react"

interface AppDashboardProps {
    trades: any[]
    userEmail?: string | null
    userName?: string | null
}

export function AppDashboard({ trades, userEmail, userName }: AppDashboardProps) {
    const [activeTab, setActiveTab] = useState<"home" | "analytics" | "journal" | "profile">("home")
    const [analyticsView, setAnalyticsView] = useState<"chart" | "calendar">("chart")
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [focusDate, setFocusDate] = useState<Date | null>(null)
    const { theme, setTheme } = useTheme() // Get current theme
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
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

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }

    return (
        <div className="w-full max-w-7xl px-4 md:px-8 pt-6 pb-28 md:pb-10 relative">

            {/* ... [DESKTOP VIEW CODE - UNCHANGED] ... */}
            <div className="hidden md:block space-y-6">
                <Tabs defaultValue="overview" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                            <p className="text-muted-foreground">Track your performance and analyze your edge.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ImportTrades />
                            <ReportDownloader trades={trades} />
                            <TabsList>
                                <TabsTrigger value="overview" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
                                <TabsTrigger value="analytics" className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Analytics</TabsTrigger>
                                <TabsTrigger value="news" className="flex items-center gap-2"><Newspaper className="h-4 w-4" /> News</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div><DashboardOverview trades={trades} /></div>
                                <div className="h-[1px] w-full bg-border/40" />
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Recent Executions</h3>
                                    <div className="bg-card rounded-xl border shadow-sm p-0 overflow-hidden h-[320px]">
                                        <TradeHistory trades={trades} focusDate={focusDate} onClearFocus={() => setFocusDate(null)} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 flex flex-col h-full">
                                <h3 className="font-semibold text-lg">P/L Calendar</h3>
                                <div className="bg-card rounded-xl border shadow-sm p-6 flex-1 flex flex-col">
                                    <PnlCalendar trades={trades} selectedDate={focusDate} onSelectDate={setFocusDate} />
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

            {/* ================= MOBILE VIEW ================= */}
            <div className="md:hidden space-y-6">

                {activeTab === "home" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                            <p className="text-sm text-muted-foreground">Market Snapshot</p>
                        </div>
                        <DashboardOverview trades={trades} />
                        <div className="pt-2"><MarketNews /></div>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                            <div className="flex bg-muted rounded-lg p-1 gap-1">
                                <button onClick={() => setAnalyticsView("chart")} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${analyticsView === "chart" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Chart</button>
                                <button onClick={() => setAnalyticsView("calendar")} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${analyticsView === "calendar" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Calendar</button>
                            </div>
                        </div>
                        <div className="min-h-[400px]">
                            {analyticsView === "chart" ? <EquityChart trades={trades} /> : <div className="space-y-2"><PnlCalendar trades={trades} selectedDate={focusDate} onSelectDate={setFocusDate} /></div>}
                        </div>
                    </div>
                )}

                {activeTab === "journal" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-2xl font-bold tracking-tight mb-4">Journal</h2>
                        <div className="pb-10"><TradeHistory trades={trades} /></div>
                    </div>
                )}

                {/* --- UPDATED PROFILE TAB --- */}
                {activeTab === "profile" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                            <p className="text-sm text-muted-foreground">Manage your settings</p>
                        </div>

                        {/* User Card */}
                        <div className="flex items-center gap-4 p-5 bg-card border rounded-2xl shadow-sm">
                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                                <AvatarImage src="" /> {/* Left empty to trigger fallback */}
                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-700 text-white text-xl font-bold">
                                    {userName ? getInitials(userName) : "T"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg leading-none">{userName || "Trader"}</h3>
                                <p className="text-sm text-muted-foreground break-all">{userEmail || "user@example.com"}</p>
                            </div>
                        </div>

                        <div className="space-y-6">

                            {/* Theme Toggle Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Appearance</h4>
                                <div className="flex items-center justify-between p-4 bg-card border rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <Moon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">Dark Mode</span>
                                            <span className="text-xs text-muted-foreground">Adjust display theme</span>
                                        </div>
                                    </div>
                                    {mounted && (
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Data Management Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Data Management</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* These components now render visible text */}
                                    <div className="[&>button]:w-full [&>button]:h-12 [&>button]:justify-start [&>button]:rounded-xl [&>button]:font-medium">
                                        <ImportTrades />
                                    </div>
                                    <div className="[&>button]:w-full [&>button]:h-12 [&>button]:justify-start [&>button]:rounded-xl [&>button]:font-medium">
                                        <ReportDownloader trades={trades} />
                                    </div>
                                </div>
                            </div>

                            {/* Logout Section */}
                            <div className="pt-6">
                                <Button
                                    variant="destructive"
                                    className="w-full h-12 rounded-xl font-semibold shadow-md bg-red-600 hover:bg-red-700"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log Out
                                </Button>
                                <p className="text-center text-[10px] text-muted-foreground mt-4 opacity-50">
                                    TradeX v1.0.2 • Build 2026
                                </p>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* Scroll To Top */}
            {showScrollTop && (
                <Button onClick={scrollToTop} size="icon" className="fixed bottom-24 right-4 z-50 rounded-full shadow-lg bg-primary/90 hover:bg-primary transition-all duration-300 animate-in fade-in zoom-in">
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-lg p-1 md:hidden z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center px-2 h-16">
                    <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "home" ? "text-green-600" : "text-muted-foreground"}`}>
                        <LayoutDashboard className="h-5 w-5" /> <span className="text-[10px] font-medium">Home</span>
                    </button>
                    <button onClick={() => setActiveTab("analytics")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "analytics" ? "text-green-600" : "text-muted-foreground"}`}>
                        <LineChart className="h-5 w-5" /> <span className="text-[10px] font-medium">Stats</span>
                    </button>
                    <div className="-mt-8">
                        <Link href="/add" className="md:hidden">
                            <Button size="icon" className="h-14 w-14 rounded-full shadow-xl border-4 border-background bg-green-600 hover:bg-green-700 text-white"><Plus className="h-7 w-7" /></Button>
                        </Link>
                    </div>
                    <button onClick={() => setActiveTab("journal")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "journal" ? "text-green-600" : "text-muted-foreground"}`}>
                        <List className="h-5 w-5" /> <span className="text-[10px] font-medium">Logs</span>
                    </button>
                    <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "profile" ? "text-green-600" : "text-muted-foreground"}`}>
                        <User className="h-5 w-5" /> <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    )
}