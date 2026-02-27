"use client"

import { useState, useRef } from "react"
import { Sparkles, UploadCloud, X, Send, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChartAnalyzerProps {
    onClose?: () => void
    isMobile?: boolean
}

export function ChartAnalyzer({ onClose, isMobile = false }: ChartAnalyzerProps) {
    const [image, setImage] = useState<string | null>(null)
    const [ticker, setTicker] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setImage(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleAnalyze = async () => {
        if (!image || !ticker) return;
        setIsAnalyzing(true);

        try {
            const response = await fetch('/api/analyze-chart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: image,
                    ticker: ticker,
                    prompt: "Analyze the technical setup in this chart and predict the probable trajectory based on the latest news."
                })
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data.result);
            } else {
                setResult("Error analyzing chart. Please try again.");
            }
        } catch (error) {
            setResult("Connection error. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    }

    const reset = () => {
        setImage(null)
        setTicker("")
        setResult(null)
    }

    return (
        <div className={`flex flex-col bg-card ${!isMobile && "h-[500px]"} w-full`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-500/10 rounded-lg">
                        <Sparkles className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-sm">Trade AI Coach</h3>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Intro Message */}
                {!result && !isAnalyzing && (
                    <div className="bg-muted/50 p-3 rounded-xl rounded-tl-none text-sm text-muted-foreground w-[85%]">
                        Upload a chart screenshot and enter the ticker. I'll analyze the technicals and the latest news to predict the probable trajectory.
                    </div>
                )}

                {/* Result Message */}
                {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl rounded-tr-none text-sm text-foreground">
                            {result}
                        </div>
                        <Button variant="outline" size="sm" onClick={reset} className="w-full">
                            Analyze Another Chart
                        </Button>
                    </div>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        <p className="text-sm animate-pulse">Analyzing chart & fetching news...</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            {!result && !isAnalyzing && (
                <div className="p-4 border-t border-border/50 bg-background space-y-3">
                    {/* Image Preview / Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${image ? 'border-green-500/50 p-0 h-32' : 'border-border hover:border-muted-foreground/50 p-4 h-24'}`}
                    >
                        {image ? (
                            <>
                                <img src={image} alt="Chart preview" className="object-cover w-full h-full opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center bg-background/20 hover:bg-background/40 transition-colors">
                                    <span className="text-xs font-semibold bg-background/90 px-2 py-1 rounded-md shadow-sm">Change Image</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="h-6 w-6 text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground font-medium">Upload Chart Screenshot</p>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>

                    {/* Ticker & Submit */}
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Stock Ticker (e.g. RELIANCE)"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            className="h-10 text-sm focus-visible:ring-green-500"
                        />
                        <Button
                            onClick={handleAnalyze}
                            disabled={!image || !ticker}
                            size="icon"
                            className="h-10 w-10 shrink-0 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}