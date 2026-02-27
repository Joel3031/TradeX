"use client"

import Link from "next/link"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, List, Plus, LineChart, Calendar as CalendarIcon, Newspaper, ArrowUp, User, Moon, LogOut, Receipt, Sparkles, X, MessageSquare, Paperclip } from "lucide-react"

// --- 1. Custom Markdown Formatter ---
const formatAIResponse = (text: string) => {
    // Split text by markdown bold markers **...**
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
        // Render bold text
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }

        // Render normal text, handling line breaks and cleaning up bullet points
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
            i += Math.floor(Math.random() * 3) + 2; // Types 2-4 characters per tick for a natural, fast feel
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


interface AppDashboardProps {
    trades: any[]
    userEmail?: string | null
    userName?: string | null
    initialShowNetPnl?: boolean
}

export function AppDashboard({ trades, userEmail, userName, initialShowNetPnl = true }: AppDashboardProps) {
    const [activeTab, setActiveTab] = useState<"home" | "analytics" | "journal" | "ai" | "profile">("home")
    const [analyticsView, setAnalyticsView] = useState<"chart" | "calendar">("chart")
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [focusDate, setFocusDate] = useState<Date | null>(null)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Unified AI Chat State
    const [chatInput, setChatInput] = useState("")
    const [chatImage, setChatImage] = useState<string | null>(null)

    // Updated interface to track ID and Animation state
    const [chatMessages, setChatMessages] = useState<{ id: string, role: 'user' | 'ai', text: string, image?: string | null, animated?: boolean }[]>([])
    const [isAiTyping, setIsAiTyping] = useState(false)

    const chatScrollRef = useRef<HTMLDivElement>(null)
    const desktopChatScrollRef = useRef<HTMLDivElement>(null)
    const mobileFileInputRef = useRef<HTMLInputElement>(null)
    const desktopFileInputRef = useRef<HTMLInputElement>(null)

    const [showNetPnl, setShowNetPnl] = useState(initialShowNetPnl)

    const displayTrades = useMemo(() => {
        return trades.map(t => ({
            ...t,
            pnl: showNetPnl ? t.netPnl : t.grossPnl
        }))
    }, [trades, showNetPnl])

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

    // Auto-scroll chat to bottom perfectly (triggers continuously while typing)
    useEffect(() => {
        requestAnimationFrame(() => {
            if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
            if (desktopChatScrollRef.current) desktopChatScrollRef.current.scrollTop = desktopChatScrollRef.current.scrollHeight
        });
    });

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => setShowScrollTop(window.scrollY > 300)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

    const getInitials = (name: string) => name ? name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() : "T"
    const firstName = userName ? userName.split(' ')[0] : "Trader"

    const handleAiSubmit = async (text: string) => {
        if (!text.trim() && !chatImage) return

        const currentImage = chatImage;
        const currentText = text;

        setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: currentText, image: currentImage }])
        setChatInput("")
        setChatImage(null)
        setIsAiTyping(true)

        try {
            const potentialTicker = currentText.length < 20
                ? currentText.trim()
                : (currentText.match(/\b[a-zA-Z]{3,15}\b/)?.[0] || "Indian Stock Market");

            const response = await fetch('/api/analyze-chart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: currentImage,
                    ticker: potentialTicker,
                    prompt: currentText
                })
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
        <div className="w-full max-w-7xl px-4 md:px-8 pt-6 pb-28 md:pb-10 relative">

            {/* Desktop View */}
            <div className="hidden md:block space-y-6">
                <Tabs defaultValue="overview" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                            <p className="text-muted-foreground">
                                Viewing: <span className="font-semibold text-foreground">{showNetPnl ? "Net P&L (After Tax)" : "Gross P&L (Before Tax)"}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* THE FIX: 
                              1. Forced !h-14 (56px) on the parent to override any Shadcn defaults.
                              2. Removed vertical padding (py-0), using only horizontal padding (px-2.5).
                              3. Flex 'items-center' perfectly centers the 40px child inside the 56px parent. 
                            */}
                            <TabsList className="inline-flex items-center px-2.5 py-0 bg-zinc-200/50 dark:bg-[#0a0a0a] rounded-full !h-14 w-fit gap-2 border border-border/20 shadow-inner ml-4">
                                <TabsTrigger
                                    value="overview"
                                    className="group relative flex items-center justify-center rounded-full !h-10 !py-0 px-3.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=active]:px-6 data-[state=active]:!bg-white dark:data-[state=active]:!bg-white data-[state=active]:!text-emerald-800 dark:data-[state=active]:!text-emerald-800 data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-muted-foreground hover:text-foreground dark:hover:text-white outline-none ring-0 focus-visible:ring-0 border-none"
                                >
                                    <LayoutDashboard className="h-5 w-5 shrink-0 transition-transform duration-500 group-data-[state=active]:scale-110" />
                                    <span className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] max-w-0 opacity-0 group-data-[state=active]:max-w-[130px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-2.5 whitespace-nowrap font-bold tracking-wide text-sm">
                                        Overview
                                    </span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="analytics"
                                    className="group relative flex items-center justify-center rounded-full !h-10 !py-0 px-3.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=active]:px-6 data-[state=active]:!bg-white dark:data-[state=active]:!bg-white data-[state=active]:!text-emerald-800 dark:data-[state=active]:!text-emerald-800 data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-muted-foreground hover:text-foreground dark:hover:text-white outline-none ring-0 focus-visible:ring-0 border-none"
                                >
                                    <LineChart className="h-5 w-5 shrink-0 transition-transform duration-500 group-data-[state=active]:scale-110" />
                                    <span className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] max-w-0 opacity-0 group-data-[state=active]:max-w-[130px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-2.5 whitespace-nowrap font-bold tracking-wide text-sm">
                                        Analytics
                                    </span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="ai"
                                    className="group relative flex items-center justify-center rounded-full !h-10 !py-0 px-3.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=active]:px-6 data-[state=active]:!bg-white dark:data-[state=active]:!bg-white data-[state=active]:!text-emerald-800 dark:data-[state=active]:!text-emerald-800 data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-muted-foreground hover:text-foreground dark:hover:text-white outline-none ring-0 focus-visible:ring-0 border-none"
                                >
                                    <Sparkles className="h-5 w-5 shrink-0 transition-transform duration-500 group-data-[state=active]:scale-110" />
                                    <span className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] max-w-0 opacity-0 group-data-[state=active]:max-w-[130px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-2.5 whitespace-nowrap font-bold tracking-wide text-sm">
                                        AI Coach
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
                        {/* Overview Content (Unchanged) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div><DashboardOverview trades={displayTrades} /></div>
                                <div className="h-[1px] w-full bg-border/40" />
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Recent Executions</h3>
                                    <div className="bg-card rounded-xl border shadow-sm p-0 overflow-hidden h-[320px]">
                                        <TradeHistory trades={displayTrades} focusDate={focusDate} onClearFocus={() => setFocusDate(null)} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 flex flex-col h-full">
                                <h3 className="font-semibold text-lg">P/L Calendar</h3>
                                <div className="bg-card rounded-xl border shadow-sm p-6 flex-1 flex flex-col">
                                    <PnlCalendar trades={displayTrades} selectedDate={focusDate} onSelectDate={setFocusDate} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4 animate-in fade-in-50 duration-500">
                        <EquityChart trades={displayTrades} />
                    </TabsContent>

                    {/* FIXED HEIGHT AI CHAT TAB (DESKTOP) */}
                    <TabsContent value="ai" className="mt-0 focus-visible:outline-none focus-visible:ring-0">

                        {/* The Strict Layout Wrapper: 
                          Increased the offset to 280px to safely clear all top/bottom page padding and headers,
                          guaranteeing the main window scrollbar will never appear.
                        */}
                        <div
                            className="flex flex-col border border-border/40 rounded-2xl bg-card shadow-sm overflow-hidden animate-in fade-in-50 duration-500 w-full"
                            style={{ height: "calc(100vh - 280px)", minHeight: "500px", maxHeight: "850px" }}
                        >
                            {/* Chat Stream Area - flex-1 takes remaining space, min-h-0 strictly forces inner scroll */}
                            <div ref={desktopChatScrollRef} className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 flex flex-col scroll-smooth">
                                {chatMessages.length === 0 ? (
                                    // Gemini Empty State
                                    <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full space-y-12 pb-10">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                                Hello, {firstName}
                                            </h1>
                                            <h2 className="text-4xl md:text-5xl font-semibold text-muted-foreground/60">
                                                How can I help you trade today?
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <button onClick={() => handleAiSubmit("What's the probable trajectory?")} className="p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/50 text-left space-y-2 transition-colors">
                                                <LineChart className="h-6 w-6 text-emerald-500" />
                                                <p className="text-sm text-foreground/80">What's the probable trajectory?</p>
                                            </button>
                                            <button onClick={() => handleAiSubmit("Analyze the current support levels")} className="p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/50 text-left space-y-2 transition-colors">
                                                <List className="h-6 w-6 text-emerald-500" />
                                                <p className="text-sm text-foreground/80">Analyze the current support levels</p>
                                            </button>
                                            <button onClick={() => handleAiSubmit("Summarize today's market news")} className="p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/50 text-left space-y-2 transition-colors">
                                                <Newspaper className="h-6 w-6 text-emerald-500" />
                                                <p className="text-sm text-foreground/80">Summarize today's market news</p>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Active Chat Stream
                                    <div className="max-w-3xl mx-auto w-full space-y-8 pb-4">
                                        {chatMessages.map((msg) => (
                                            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'ai' && (
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                        <Sparkles className="h-5 w-5 text-white" />
                                                    </div>
                                                )}

                                                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`rounded-3xl px-6 py-4 text-[16px] leading-relaxed ${msg.role === 'user'
                                                        ? 'bg-muted/60 text-foreground border border-border/50 rounded-tr-sm'
                                                        : 'bg-transparent text-foreground'
                                                        }`}>
                                                        {msg.image && (
                                                            <img src={msg.image} alt="Attached chart" className="w-full max-w-[300px] rounded-xl mb-3 border border-border/20 object-cover shadow-sm" />
                                                        )}

                                                        {msg.role === 'ai' && msg.animated === false ? (
                                                            <TypewriterText
                                                                text={msg.text}
                                                                onComplete={() => {
                                                                    setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, animated: true } : m))
                                                                }}
                                                            />
                                                        ) : msg.role === 'ai' ? (
                                                            <>{formatAIResponse(msg.text)}</>
                                                        ) : (
                                                            <>{msg.text}</>
                                                        )}
                                                    </div>
                                                </div>

                                                {msg.role === 'user' && (
                                                    <Avatar className="h-10 w-10 shrink-0 mt-1">
                                                        <AvatarImage src="" />
                                                        <AvatarFallback className="bg-amber-500 text-white font-medium">{getInitials(userName || "")}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        ))}
                                        {isAiTyping && (
                                            <div className="flex gap-4 justify-start">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-4">
                                                    <span className="h-2 w-2 bg-emerald-500/50 rounded-full animate-bounce" />
                                                    <span className="h-2 w-2 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="h-2 w-2 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Fixed Input Area - shrink-0 strictly locks it to the bottom */}
                            <div className="shrink-0 p-4 md:p-6 bg-card border-t border-border/40 z-10">
                                <div className="max-w-3xl mx-auto">
                                    {chatImage && (
                                        <div className="mb-3 relative inline-block">
                                            <img src={chatImage} alt="Upload preview" className="h-20 w-20 object-cover rounded-xl border border-border/50 shadow-sm" />
                                            <button onClick={() => setChatImage(null)} className="absolute -top-2 -right-2 bg-muted text-foreground rounded-full p-1.5 shadow-md border border-border/50 hover:bg-background">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="relative flex items-center bg-muted/30 border border-border/50 rounded-full p-2 pl-4 focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all shadow-sm">
                                        <input type="file" ref={desktopFileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                        <button onClick={() => desktopFileInputRef.current?.click()} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted shrink-0">
                                            <Paperclip className="h-5 w-5" />
                                        </button>
                                        <input
                                            type="text"
                                            placeholder="Ask me anything..."
                                            className="flex-1 bg-transparent border-none focus:outline-none text-[16px] px-3 h-12 min-w-0"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit(chatInput)}
                                        />
                                        {(chatInput.trim() || chatImage) ? (
                                            <button onClick={() => handleAiSubmit(chatInput)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-11 w-11 flex items-center justify-center shrink-0 transition-all animate-in zoom-in">
                                                <ArrowUp className="h-5 w-5" />
                                            </button>
                                        ) : <div className="w-11 shrink-0" />}
                                    </div>
                                    <p className="text-center text-xs text-muted-foreground mt-3">Trade AI can make mistakes. Consider verifying important information.</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-6">
                {activeTab === "home" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                            <p className="text-sm text-muted-foreground">
                                {showNetPnl ? "Net P&L" : "Gross P&L"} View
                            </p>
                        </div>
                        <DashboardOverview trades={displayTrades} />

                        <div className="pt-6 space-y-4">
                            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                <h2 className="text-xl font-bold tracking-tight">Trade Logs</h2>
                            </div>
                            <TradeHistory trades={displayTrades} />
                        </div>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                            <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50 gap-1">
                                <button onClick={() => setAnalyticsView("chart")} className={`p-2 rounded-md transition-all ${analyticsView === "chart" ? "bg-background shadow-sm text-foreground ring-1 ring-border/10" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"}`}>
                                    <LineChart className="h-4 w-4" />
                                </button>
                                <button onClick={() => setAnalyticsView("calendar")} className={`p-2 rounded-md transition-all ${analyticsView === "calendar" ? "bg-background shadow-sm text-foreground ring-1 ring-border/10" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"}`}>
                                    <CalendarIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[400px]">
                            {analyticsView === "chart" ? (
                                <EquityChart trades={displayTrades} />
                            ) : (
                                <div className="space-y-2">
                                    <PnlCalendar trades={displayTrades} selectedDate={focusDate} onSelectDate={setFocusDate} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Mobile AI Assist Full-Screen Experience */}
                {activeTab === "ai" && (
                    <div className="fixed inset-0 z-40 bg-background flex flex-col pb-16 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/20 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-lg text-foreground">AI Assist</span>
                            </div>
                            <button onClick={() => setActiveTab("home")} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Chat / Content Area */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col scroll-smooth">
                            {chatMessages.length === 0 ? (
                                // Empty State
                                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                        <Sparkles className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="font-medium text-foreground">Ask anything about the chart</h3>

                                    <div className="flex flex-col gap-3 w-full max-w-xs mt-8 items-end">
                                        <button onClick={() => handleAiSubmit("What's the probable trajectory?")} className="bg-card hover:bg-muted text-sm py-2.5 px-5 rounded-full text-foreground border shadow-sm transition-colors">
                                            What's the probable trajectory?
                                        </button>
                                        <button onClick={() => handleAiSubmit("Analyze the current support levels")} className="bg-card hover:bg-muted text-sm py-2.5 px-5 rounded-full text-foreground border shadow-sm transition-colors">
                                            Analyze the current support levels
                                        </button>
                                        <button onClick={() => handleAiSubmit("Summarize today's market news")} className="bg-card hover:bg-muted text-sm py-2.5 px-5 rounded-full text-foreground border shadow-sm transition-colors">
                                            Summarize today's market news
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Active Chat State
                                <div className="space-y-6 pb-4">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className="flex gap-3">
                                            {msg.role === 'user' ? (
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage src="" />
                                                    <AvatarFallback className="bg-amber-500 text-white text-xs">{getInitials(userName || "")}</AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                                                    <Sparkles className="h-4 w-4 text-white" />
                                                </div>
                                            )}

                                            <div className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed max-w-[85%] ${msg.role === 'user'
                                                ? 'bg-muted/60 text-foreground border border-border/50'
                                                : 'bg-green-50 dark:bg-green-950/40 text-green-950 dark:text-green-100'
                                                }`}>
                                                {msg.image && (
                                                    <img src={msg.image} alt="Attached chart" className="w-full max-w-[200px] rounded-lg mb-2 border border-border/20 object-cover" />
                                                )}

                                                {/* IMPLEMENTED MARKDOWN PARSER & TYPEWRITER HERE */}
                                                {msg.role === 'ai' && msg.animated === false ? (
                                                    <TypewriterText
                                                        text={msg.text}
                                                        onComplete={() => {
                                                            setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, animated: true } : m))
                                                        }}
                                                    />
                                                ) : msg.role === 'ai' ? (
                                                    <>{formatAIResponse(msg.text)}</>
                                                ) : (
                                                    <>{msg.text}</>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isAiTyping && (
                                        <div className="flex gap-3 animate-in fade-in duration-300">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                                                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                                            </div>
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

                        {/* Sticky Input Field */}
                        <div className="p-3 bg-background border-t border-border/20 shrink-0 z-10">
                            {chatImage && (
                                <div className="px-2 pb-3">
                                    <div className="relative inline-block">
                                        <img src={chatImage} alt="Upload preview" className="h-14 w-14 object-cover rounded-lg border border-border/50 shadow-sm" />
                                        <button onClick={() => setChatImage(null)} className="absolute -top-2 -right-2 bg-muted text-foreground rounded-full p-1 shadow-md border border-border/50 hover:bg-background">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center bg-muted/40 border border-border/50 rounded-full p-1 pl-2 focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500 transition-all shadow-sm">
                                <input type="file" ref={mobileFileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                <button onClick={() => mobileFileInputRef.current?.click()} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full shrink-0">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Ask me anything"
                                    className="flex-1 bg-transparent border-none focus:outline-none text-[15px] px-2 h-10 min-w-0"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit(chatInput)}
                                />
                                {(chatInput.trim() || chatImage) ? (
                                    <button onClick={() => handleAiSubmit(chatInput)} className="bg-green-600 hover:bg-green-700 text-white rounded-full h-9 w-9 flex items-center justify-center shrink-0 transition-all animate-in zoom-in">
                                        <ArrowUp className="h-5 w-5" />
                                    </button>
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
                                <AvatarImage src="" />
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
                            <div className="space-y-3">
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Calculation Preferences</h4>
                                <div className="flex items-center justify-between p-4 bg-card border rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                            <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">Show Net P&L (After Tax)</span>
                                            <span className="text-xs text-muted-foreground">Deduct brokerage & charges</span>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={showNetPnl}
                                        onCheckedChange={handlePreferenceChange}
                                    />
                                </div>
                            </div>

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

                            <div className="space-y-3">
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Data Management</h4>
                                <div className="flex justify-around gap-4">
                                    <div className="w-full max-w-[180px] [&>button]:w-full [&>button]:h-12 [&>button]:justify-center [&>button]:rounded-xl [&>button]:font-medium">
                                        <ImportTrades />
                                    </div>
                                    <div className="w-full max-w-[180px] [&>button]:w-full [&>button]:h-12 [&>button]:justify-center [&>button]:rounded-xl [&>button]:font-medium">
                                        <ReportDownloader trades={displayTrades} userName={userName} userEmail={userEmail} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button variant="destructive" className="w-full h-12 rounded-xl font-semibold shadow-md bg-red-600 hover:bg-red-700" onClick={() => signOut()}>
                                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                                </Button>
                                <p className="text-center text-[10px] text-muted-foreground mt-4 opacity-50">TradeX v1.0.2 • Build 2026</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showScrollTop && (
                <Button onClick={scrollToTop} size="icon" className="fixed bottom-24 right-4 z-50 rounded-full shadow-lg bg-primary/90 hover:bg-primary transition-all duration-300 animate-in fade-in zoom-in">
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}

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
                    <button onClick={() => setActiveTab("ai")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "ai" ? "text-green-600" : "text-muted-foreground"}`}>
                        <Sparkles className="h-5 w-5" /> <span className="text-[10px] font-medium">AI Coach</span>
                    </button>
                    <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${activeTab === "profile" ? "text-green-600" : "text-muted-foreground"}`}>
                        <User className="h-5 w-5" /> <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    )
}