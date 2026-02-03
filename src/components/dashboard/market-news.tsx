"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, RefreshCw, Loader2, Newspaper } from "lucide-react"
import { getMarketNews } from "@/app/actions/get-news"

interface NewsItem {
    title: string
    link: string
    pubDate: string
    source: string
}

export function MarketNews() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    const fetchNews = useCallback(async () => {
        setLoading(true)
        const data = await getMarketNews()
        setNews(data)
        setLastUpdated(new Date())
        setLoading(false)
    }, [])

    // Initial Fetch + Auto Refresh Interval (30 Mins)
    useEffect(() => {
        fetchNews()

        const intervalId = setInterval(() => {
            fetchNews()
        }, 30 * 60 * 1000)

        return () => clearInterval(intervalId)
    }, [fetchNews])

    return (
        <div className="w-full relative">

            {/* =================================================== */}
            {/* STICKY HEADER SECTION                               */}
            {/* =================================================== */}
            {/* 1. sticky top-16: Sticks 64px from top (height of main header) 
          2. z-40: Stays above content
          3. -mx-4 px-4: Pulls header to screen edges on mobile
          4. backdrop-blur-md: Adds the "glass" effect over scrolling text
      */}
            <div className="sticky top-16 z-40 flex items-center justify-between py-3 mb-4 -mx-4 px-4 md:mx-0 md:px-0 backdrop-blur-md border-y border-border/40 md:border-none md:bg-transparent transition-all">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                        <Newspaper className="h-4 w-4 text-green-700 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Market Updates</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground hidden sm:inline font-medium">
                        {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchNews}
                        disabled={loading}
                        className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-green-600" : "text-muted-foreground"}`} />
                    </Button>
                </div>
            </div>

            {/* News List */}
            <div className="space-y-4 px-1 md:px-0 pb-4">
                {loading && news.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground animate-in fade-in">
                        <div className="p-3 bg-muted/50 rounded-full">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                        <p className="text-xs font-medium uppercase tracking-wider">Fetching headlines...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No news available at the moment.
                    </div>
                ) : (
                    news.map((item, index) => (
                        <div key={index} className="group flex flex-col gap-2 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[15px] md:text-base font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors leading-snug"
                            >
                                {item.title}
                            </a>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-green-700 dark:text-green-400/80 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-[4px]">
                                        {item.source}
                                    </span>
                                    <span className="text-muted-foreground/60">•</span>
                                    <span>{item.pubDate ? new Date(item.pubDate).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    }) : "Just now"}</span>
                                </div>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}