"use client"

import { useEffect, useRef, memo } from "react"
import { useTheme } from "next-themes"

function SingleTicker({ symbol, name }: { symbol: string, name: string }) {
    const container = useRef<HTMLDivElement>(null)
    const { theme } = useTheme() // Detect current theme

    useEffect(() => {
        if (container.current) {
            container.current.innerHTML = "" // Clear previous to prevent duplicates
            const script = document.createElement("script")
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js"
            script.type = "text/javascript"
            script.async = true
            script.innerHTML = JSON.stringify({
                "symbol": symbol,
                "width": "100%",
                "isTransparent": true,
                "colorTheme": "dark", // Always use dark for your "Pro" look, or use {theme} variable
                "locale": "en"
            })
            container.current.appendChild(script)
        }
    }, [theme]) // Re-render if theme changes

    return (
        <div className="flex-1 min-w-[200px]" ref={container}></div>
    )
}

function MarketTickerComponent() {
    return (
        <div className="w-full max-w-7xl px-4 md:px-8 pt-4 pb-2 flex flex-wrap gap-4">
            {/* Nifty 50 Badge */}
            <div className="flex-1 h-[70px] overflow-hidden rounded-lg border bg-card/50 shadow-sm relative">
                {/* We use negative margin to hide the 'View on TradingView' bottom link if possible, 
            though usually the Single Quote widget is clean enough. */}
                <div className="-mt-2 -ml-2 w-[105%]">
                    <SingleTicker symbol="NSE:NIFTY" name="Nifty 50" />
                </div>
            </div>

            {/* Sensex Badge */}
            <div className="flex-1 h-[70px] overflow-hidden rounded-lg border bg-card/50 shadow-sm relative">
                <div className="-mt-2 -ml-2 w-[105%]">
                    <SingleTicker symbol="BSE:SENSEX" name="Sensex" />
                </div>
            </div>
        </div>
    )
}

export const MarketTicker = memo(MarketTickerComponent)