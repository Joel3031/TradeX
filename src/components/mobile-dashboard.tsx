"use client"

import Link from "next/link"
import Image from "next/image"
import React, { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { TradeHistory } from "@/components/trade-history"
import { EquityChart } from "@/components/dashboard/equity-chart"
import { PnlCalendar } from "@/components/dashboard/pnl-calendar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ReportDownloader } from "@/components/dashboard/report-downloader"
import { ImportTrades } from "@/components/dashboard/import-trades"
import { updateUserPreference } from "@/app/actions"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LayoutDashboard, List, Plus, LineChart, User, Moon, LogOut, Receipt, Sparkles, X, ArrowUp, Paperclip } from "lucide-react"
import { subMonths, subYears, isAfter } from "date-fns"

// --- 1. Custom Markdown Formatter ---
const formatAIResponse = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }

        return (
            <span key={index}>
                {part.split('\n').map((line, i, arr) => {
                    const cleanLine = line.replace(/^\s*[*+-]\s/, '• ');
                    return (
                        <React.Fragment key={i}>
                            {cleanLine}
                            {i < arr.length - 1 && <br />}
                        </React.Fragment>
                    );
                })}
            </span>
        );
    });
};

// --- 2. Custom Typewriter Component ---
const TypewriterText = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
    const [displayed, setDisplayed] = useState('');
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            i += Math.floor(Math.random() * 3) + 2;
            if (i >= text.length) {
                setDisplayed(text);
                clearInterval(timer);
                onCompleteRef.current();
            } else {
                setDisplayed(text.substring(0, i));
            }
        }, 15);
        return () => clearInterval(timer);
    }, [text]);

    return <>{formatAIResponse(displayed)}</>;
};

interface MobileDashboardProps {
    trades: any[]
    userEmail?: string | null
    userName?: string | null
    initialShowNetPnl?: boolean
}

export function MobileDashboard({ trades, userEmail, userName, initialShowNetPnl = true }: MobileDashboardProps) {
    const [activeTab, setActiveTab] = useState<"home" | "logs" | "ai" | "profile">("home")
    const [focusDate, setFocusDate] = useState<Date | null>(null)
    const [timeRange, setTimeRange] = useState<"1M" | "1Y" | "ALL">("ALL")

    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const [chatInput, setChatInput] = useState("")
    const [chatImage, setChatImage] = useState<string | null>(null)
    const [chatMessages, setChatMessages] = useState<{ id: string, role: 'user' | 'ai', text: string, image?: string | null, animated?: boolean }[]>([])
    const [isAiTyping, setIsAiTyping] = useState(false)

    const chatScrollRef = useRef<HTMLDivElement>(null)
    const mobileFileInputRef = useRef<HTMLInputElement>(null)
    const [showNetPnl, setShowNetPnl] = useState(initialShowNetPnl)

    const displayTrades = useMemo(() => {
        return trades.map(t => ({
            ...t,
            pnl: showNetPnl ? t.netPnl : t.grossPnl
        }))
    }, [trades, showNetPnl])

    // Global filtering based on time range
    const filteredTrades = useMemo(() => {
        const now = new Date();
        let cutoffDate: Date | null = null;

        if (timeRange === "1M") cutoffDate = subMonths(now, 1);
        if (timeRange === "1Y") cutoffDate = subYears(now, 1);

        return displayTrades.filter(t => {
            const dateVal = t.date || t.entryDate;
            if (!dateVal) return false;
            if (!cutoffDate) return true;
            return isAfter(new Date(dateVal), cutoffDate);
        });
    }, [displayTrades, timeRange]);

    const handlePreferenceChange = async (checked: boolean) => {
        setShowNetPnl(checked)
        const res = await updateUserPreference("showNetPnl", checked)
        if (!res.success) toast.error("Failed to save preference")
        else toast.success(`Switched to ${checked ? "Net P&L" : "Gross P&L"}`)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setChatImage(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    useEffect(() => {
        requestAnimationFrame(() => {
            if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
        });
    });

    useEffect(() => {
        setMounted(true)
    }, [])

    const getInitials = (name: string) => name ? name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() : "T"

    const handleAiSubmit = async (text: string) => {
        if (!text.trim() && !chatImage) return
        const currentImage = chatImage;
        const currentText = text;

        setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: currentText, image: currentImage }])
        setChatInput("")
        setChatImage(null)
        setIsAiTyping(true)

        try {
            const potentialTicker = currentText.length < 20 ? currentText.trim() : (currentText.match(/\b[a-zA-Z]{3,15}\b/)?.[0] || "Indian Stock Market");
            const response = await fetch('/api/analyze-chart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: currentImage, ticker: potentialTicker, prompt: currentText })
            });

            const data = await response.json();
            if (response.ok) {
                setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: data.result, animated: false }]);
            } else {
                setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Sorry, I encountered an error analyzing that data.", animated: false }]);
            }
        } catch (error) {
            setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Connection failed. Please check your network and try again.", animated: false }]);
        } finally {
            setIsAiTyping(false);
        }
    }

    return (
        <div className="w-full min-h-screen relative">

            {/* FIXED HEADER WITH CENTERED LOGO */}
            <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
                    <div className="relative h-8 w-28">
                        <Image
                            src="/TradeX-logo.png"
                            alt="TradeX"
                            fill
                            className="object-contain dark:invert dark:hue-rotate-180"
                            priority
                        />
                    </div>
                </div>
            </div>

            <div className="w-full px-4 pt-20 pb-28 relative">
                <div className="space-y-6">

                    {activeTab === "home" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
                                    <p className="text-sm text-muted-foreground">{showNetPnl ? "Net P&L" : "Gross P&L"} Overview</p>
                                </div>

                                {/* GLOBAL TIME RANGE FILTER BAR */}
                                <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
                                    {(["1M", "1Y", "ALL"] as const).map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                                                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <DashboardOverview trades={filteredTrades} />

                            <div className="space-y-3 pt-2">
                                <h3 className="text-lg font-semibold tracking-tight">Equity Curve</h3>
                                <div className="w-full overflow-hidden">
                                    <EquityChart trades={filteredTrades} timeRange={timeRange} />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <h3 className="text-lg font-semibold tracking-tight">P&L Calendar</h3>
                                <div className="w-full overflow-hidden">
                                    <PnlCalendar trades={filteredTrades} selectedDate={focusDate} onSelectDate={setFocusDate} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "logs" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Trade Logs</h2>
                                <p className="text-sm text-muted-foreground">Manage and review your past executions</p>
                            </div>

                            <div className="bg-transparent border-none shadow-none p-0 overflow-hidden">
                                <TradeHistory trades={displayTrades} focusDate={focusDate} onClearFocus={() => setFocusDate(null)} />
                            </div>
                        </div>
                    )}

                    {activeTab === "ai" && (
                        <div className="fixed inset-0 z-40 bg-background flex flex-col pb-16 pt-16 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between p-4 border-b border-border/20 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-lg text-foreground">AI Coach</span>
                                </div>
                                {/* <button onClick={() => setActiveTab("home")} className="p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button> */}
                            </div>

                            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col scroll-smooth">
                                {chatMessages.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                            <Sparkles className="h-10 w-10 text-white" />
                                        </div>
                                        <h3 className="font-medium text-foreground">Ask anything about the chart</h3>
                                        <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
                                            <button onClick={() => handleAiSubmit("What's the probable trajectory?")} className="bg-card hover:bg-muted text-sm py-2.5 px-5 rounded-full text-foreground border shadow-sm">What's the probable trajectory?</button>
                                            <button onClick={() => handleAiSubmit("Analyze the current support levels")} className="bg-card hover:bg-muted text-sm py-2.5 px-5 rounded-full text-foreground border shadow-sm">Analyze current support levels</button>
                                            <button onClick={() => handleAiSubmit("Summarize today's market news")} className="bg-card hover:bg-muted text-sm py-2.5 px-5 rounded-full text-foreground border shadow-sm">Summarize market news</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 pb-4">
                                        {chatMessages.map((msg) => (
                                            <div key={msg.id} className="flex gap-3">
                                                {msg.role === 'user' ? (
                                                    <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-amber-500 text-white text-xs">{getInitials(userName || "")}</AvatarFallback></Avatar>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm"><Sparkles className="h-4 w-4 text-white" /></div>
                                                )}
                                                <div className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-muted/60 text-foreground border border-border/50' : 'bg-green-50 dark:bg-green-950/40 text-green-950 dark:text-green-100'}`}>
                                                    {msg.image && <img src={msg.image} alt="Attached chart" className="w-full max-w-[200px] rounded-lg mb-2 border border-border/20 object-cover" />}
                                                    {msg.role === 'ai' && msg.animated === false ? (
                                                        <TypewriterText text={msg.text} onComplete={() => setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, animated: true } : m))} />
                                                    ) : <>{formatAIResponse(msg.text)}</>}
                                                </div>
                                            </div>
                                        ))}
                                        {isAiTyping && (
                                            <div className="flex gap-3 animate-in fade-in duration-300">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm"><Sparkles className="h-4 w-4 text-white animate-pulse" /></div>
                                                <div className="bg-green-50 dark:bg-green-950/40 rounded-2xl px-4 py-3 flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 bg-green-500/50 rounded-full animate-bounce" />
                                                    <span className="h-1.5 w-1.5 bg-green-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="h-1.5 w-1.5 bg-green-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-background border-t border-border/20 shrink-0 z-10">
                                {chatImage && (
                                    <div className="px-2 pb-3">
                                        <div className="relative inline-block">
                                            <img src={chatImage} alt="Upload preview" className="h-14 w-14 object-cover rounded-lg border border-border/50 shadow-sm" />
                                            <button onClick={() => setChatImage(null)} className="absolute -top-2 -right-2 bg-muted text-foreground rounded-full p-1 shadow-md border hover:bg-background"><X className="h-3 w-3" /></button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center bg-muted/40 border border-border/50 rounded-full p-1 pl-2 focus-within:ring-1 focus-within:ring-green-500 shadow-sm">
                                    <input type="file" ref={mobileFileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                    <button onClick={() => mobileFileInputRef.current?.click()} className="p-2 text-muted-foreground hover:text-foreground rounded-full shrink-0"><Paperclip className="h-5 w-5" /></button>
                                    <input type="text" placeholder="Ask me anything" className="flex-1 bg-transparent border-none focus:outline-none text-[15px] px-2 h-10 min-w-0" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit(chatInput)} />
                                    {(chatInput.trim() || chatImage) ? (
                                        <button onClick={() => handleAiSubmit(chatInput)} className="bg-green-600 hover:bg-green-700 text-white rounded-full h-9 w-9 flex items-center justify-center shrink-0"><ArrowUp className="h-5 w-5" /></button>
                                    ) : <div className="w-9 shrink-0" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                                <p className="text-sm text-muted-foreground">Manage your settings</p>
                            </div>
                            <div className="flex items-center gap-4 p-5 bg-card border rounded-2xl shadow-sm">
                                <Avatar className="h-16 w-16 border-2 border-primary/20">
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-700 text-white text-xl font-bold">{userName ? getInitials(userName) : "T"}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg leading-none">{userName || "Trader"}</h3>
                                    <p className="text-sm text-muted-foreground break-all">{userEmail || "user@example.com"}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Calculation Preferences</h4>
                                    <div className="flex items-center justify-between p-4 bg-card border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                                            <div className="flex flex-col"><span className="font-medium text-sm">Show Net P&L (After Tax)</span><span className="text-xs text-muted-foreground">Deduct brokerage & charges</span></div>
                                        </div>
                                        <Switch checked={showNetPnl} onCheckedChange={handlePreferenceChange} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Appearance</h4>
                                    <div className="flex items-center justify-between p-4 bg-card border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Moon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" /></div>
                                            <div className="flex flex-col"><span className="font-medium text-sm">Dark Mode</span><span className="text-xs text-muted-foreground">Adjust display theme</span></div>
                                        </div>
                                        {mounted && <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Data Management</h4>
                                    <div className="flex justify-around gap-4">
                                        <div className="w-full max-w-[180px] [&>button]:w-full [&>button]:h-12 [&>button]:justify-center [&>button]:rounded-xl"><ImportTrades /></div>
                                        <div className="w-full max-w-[180px] [&>button]:w-full [&>button]:h-12 [&>button]:justify-center [&>button]:rounded-xl"><ReportDownloader trades={displayTrades} userName={userName} userEmail={userEmail} /></div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button variant="destructive" className="w-full h-12 rounded-xl font-semibold bg-red-600 hover:bg-red-700" onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4" /> Log Out</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-lg p-1 md:hidden z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center px-2 h-16">
                        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "home" ? "text-green-600" : "text-muted-foreground"}`}>
                            <LayoutDashboard className="h-5 w-5" /><span className="text-[10px] font-medium">Home</span>
                        </button>
                        <button onClick={() => setActiveTab("logs")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "logs" ? "text-green-600" : "text-muted-foreground"}`}>
                            <List className="h-5 w-5" /><span className="text-[10px] font-medium">Logs</span>
                        </button>
                        <div className="-mt-8">
                            <Link href="/add" className="md:hidden">
                                <Button size="icon" className="h-14 w-14 rounded-full shadow-xl border-4 border-background bg-green-600 hover:bg-green-700 text-white"><Plus className="h-7 w-7" /></Button>
                            </Link>
                        </div>
                        <button onClick={() => setActiveTab("ai")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "ai" ? "text-green-600" : "text-muted-foreground"}`}>
                            <Sparkles className="h-5 w-5" /><span className="text-[10px] font-medium">AI Coach</span>
                        </button>
                        <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "profile" ? "text-green-600" : "text-muted-foreground"}`}>
                            <User className="h-5 w-5" /><span className="text-[10px] font-medium">Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}