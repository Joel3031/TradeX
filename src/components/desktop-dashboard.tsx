"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { TradeHistory } from "@/components/trade-history"
import { EquityChart } from "@/components/dashboard/equity-chart"
import { PnlCalendar } from "@/components/dashboard/pnl-calendar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { updateUserPreference } from "@/app/actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, List, LineChart, Sparkles, Newspaper, ArrowUp, X, Paperclip } from "lucide-react"

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

interface DesktopDashboardProps {
    trades: any[]
    userEmail?: string | null
    userName?: string | null
    initialShowNetPnl?: boolean
}

export function DesktopDashboard({ trades, userEmail, userName, initialShowNetPnl = true }: DesktopDashboardProps) {
    const [focusDate, setFocusDate] = useState<Date | null>(null)
    const [chatInput, setChatInput] = useState("")
    const [chatImage, setChatImage] = useState<string | null>(null)
    const [chatMessages, setChatMessages] = useState<{ id: string, role: 'user' | 'ai', text: string, image?: string | null, animated?: boolean }[]>([])
    const [isAiTyping, setIsAiTyping] = useState(false)

    const desktopChatScrollRef = useRef<HTMLDivElement>(null)
    const desktopFileInputRef = useRef<HTMLInputElement>(null)
    const [showNetPnl, setShowNetPnl] = useState(initialShowNetPnl)

    const displayTrades = useMemo(() => {
        return trades.map(t => ({
            ...t,
            pnl: showNetPnl ? t.netPnl : t.grossPnl
        }))
    }, [trades, showNetPnl])

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
            if (desktopChatScrollRef.current) desktopChatScrollRef.current.scrollTop = desktopChatScrollRef.current.scrollHeight
        });
    });

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
        <div className="w-full min-h-screen flex flex-col max-w-7xl mx-auto px-4 md:px-8 pb-10 relative">
            <div className="space-y-6 flex-1">
                <Tabs defaultValue="overview" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                            <p className="text-muted-foreground">
                                Viewing: <span className="font-semibold text-foreground">{showNetPnl ? "Net P&L (After Tax)" : "Gross P&L (Before Tax)"}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <TabsList className="inline-flex items-center px-2.5 py-0 bg-zinc-200/50 dark:bg-[#0a0a0a] rounded-full !h-14 w-fit gap-2 border border-border/20 shadow-inner ml-2">
                                <TabsTrigger value="overview" className="group relative flex items-center justify-center rounded-full !h-10 !py-0 px-3.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=active]:px-6 data-[state=active]:!bg-white dark:data-[state=active]:!bg-white data-[state=active]:!text-emerald-800 data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-muted-foreground outline-none">
                                    <LayoutDashboard className="h-5 w-5 shrink-0 transition-transform duration-500 group-data-[state=active]:scale-110" />
                                    <span className="overflow-hidden transition-all duration-500 max-w-0 opacity-0 group-data-[state=active]:max-w-[130px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-2.5 whitespace-nowrap font-bold tracking-wide text-sm">Overview</span>
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="group relative flex items-center justify-center rounded-full !h-10 !py-0 px-3.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=active]:px-6 data-[state=active]:!bg-white dark:data-[state=active]:!bg-white data-[state=active]:!text-emerald-800 data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-muted-foreground outline-none">
                                    <LineChart className="h-5 w-5 shrink-0 transition-transform duration-500 group-data-[state=active]:scale-110" />
                                    <span className="overflow-hidden transition-all duration-500 max-w-0 opacity-0 group-data-[state=active]:max-w-[130px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-2.5 whitespace-nowrap font-bold tracking-wide text-sm">Analytics</span>
                                </TabsTrigger>
                                <TabsTrigger value="ai" className="group relative flex items-center justify-center rounded-full !h-10 !py-0 px-3.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=active]:px-6 data-[state=active]:!bg-white dark:data-[state=active]:!bg-white data-[state=active]:!text-emerald-800 data-[state=active]:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-muted-foreground outline-none">
                                    <Sparkles className="h-5 w-5 shrink-0 transition-transform duration-500 group-data-[state=active]:scale-110" />
                                    <span className="overflow-hidden transition-all duration-500 max-w-0 opacity-0 group-data-[state=active]:max-w-[130px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-2.5 whitespace-nowrap font-bold tracking-wide text-sm">AI Coach</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
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

                    <TabsContent value="ai" className="mt-0 focus-visible:outline-none">
                        <div className="flex flex-col border border-border/40 rounded-2xl bg-card shadow-sm overflow-hidden animate-in fade-in-50 duration-500 w-full" style={{ height: "calc(100vh - 280px)", minHeight: "500px", maxHeight: "850px" }}>
                            <div ref={desktopChatScrollRef} className="flex-1 overflow-y-auto min-h-0 p-8 flex flex-col scroll-smooth">
                                {chatMessages.length === 0 ? (
                                    <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full space-y-12 pb-10">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Hello, {firstName}</h1>
                                            <h2 className="text-4xl md:text-5xl font-semibold text-muted-foreground/60">How can I help you trade today?</h2>
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
                                    <div className="max-w-3xl mx-auto w-full space-y-8 pb-4">
                                        {chatMessages.map((msg) => (
                                            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'ai' && (
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                        <Sparkles className="h-5 w-5 text-white" />
                                                    </div>
                                                )}
                                                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`rounded-3xl px-6 py-4 text-[16px] leading-relaxed ${msg.role === 'user' ? 'bg-muted/60 text-foreground border border-border/50 rounded-tr-sm' : 'bg-transparent text-foreground'}`}>
                                                        {msg.image && <img src={msg.image} alt="Attached chart" className="w-full max-w-[300px] rounded-xl mb-3 border border-border/20 object-cover shadow-sm" />}
                                                        {msg.role === 'ai' && msg.animated === false ? (
                                                            <TypewriterText text={msg.text} onComplete={() => setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, animated: true } : m))} />
                                                        ) : <>{formatAIResponse(msg.text)}</>}
                                                    </div>
                                                </div>
                                                {msg.role === 'user' && (
                                                    <Avatar className="h-10 w-10 shrink-0 mt-1">
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

                            <div className="shrink-0 p-6 bg-card border-t border-border/40 z-10">
                                <div className="max-w-3xl mx-auto">
                                    {chatImage && (
                                        <div className="mb-3 relative inline-block">
                                            <img src={chatImage} alt="Upload preview" className="h-20 w-20 object-cover rounded-xl border border-border/50 shadow-sm" />
                                            <button onClick={() => setChatImage(null)} className="absolute -top-2 -right-2 bg-muted text-foreground rounded-full p-1.5 shadow-md border hover:bg-background"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}
                                    <div className="relative flex items-center bg-muted/30 border border-border/50 rounded-full p-2 pl-4 focus-within:ring-1 focus-within:ring-emerald-500 shadow-sm">
                                        <input type="file" ref={desktopFileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                        <button onClick={() => desktopFileInputRef.current?.click()} className="p-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted shrink-0"><Paperclip className="h-5 w-5" /></button>
                                        <input type="text" placeholder="Ask me anything..." className="flex-1 bg-transparent border-none focus:outline-none text-[16px] px-3 h-12 min-w-0" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit(chatInput)} />
                                        {(chatInput.trim() || chatImage) ? (
                                            <button onClick={() => handleAiSubmit(chatInput)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-11 w-11 flex items-center justify-center shrink-0 transition-all"><ArrowUp className="h-5 w-5" /></button>
                                        ) : <div className="w-11 shrink-0" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}