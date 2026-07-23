"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTrade, updateTrade } from "@/app/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { calculateIntradayCharges } from "@/lib/tax-calculator"

// 1. UPDATED INTERFACE: Added missing fields
export interface TradeData {
    id?: string
    symbol: string
    category: "INTRADAY" | "OPTIONS" | "DELIVERY"
    type: "BUY" | "SELL"
    optionType?: "CE" | "PE" | ""
    strike?: string
    expiryDate?: string
    exitDate?: string
    entryPrice: string
    exitPrice: string
    quantity: string
    stopLoss: string
    date: string
    notes?: string
    fees?: number
    netPnl?: number
}

interface TradeFormProps {
    initialData?: TradeData
    onSuccess?: () => void
}

export function TradeForm({ initialData, onSuccess }: TradeFormProps) {
    const [loading, setLoading] = useState(false)

    // 2. UPDATED STATE: Initialize new fields
    const [formData, setFormData] = useState<TradeData>({
        symbol: initialData?.symbol || "",
        category: initialData?.category || "INTRADAY",
        type: initialData?.type || "BUY",
        optionType: initialData?.optionType || "CE",
        strike: initialData?.strike || "",
        expiryDate: initialData?.expiryDate || "",
        exitDate: initialData?.exitDate || "",
        entryPrice: initialData?.entryPrice || "",
        exitPrice: initialData?.exitPrice || "",
        quantity: initialData?.quantity || "",
        stopLoss: initialData?.stopLoss || "",
        date: initialData?.date || new Date().toISOString().split('T')[0],
        notes: initialData?.notes || ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.symbol) {
            toast.warning("Please enter a Symbol (e.g., NIFTY)")
            return
        }
        if (!formData.entryPrice) {
            toast.warning("Entry Price is mandatory.")
            return
        }
        if (!formData.quantity) {
            toast.warning("Please enter the Quantity.")
            return
        }
        if (!formData.date) {
            toast.warning("Please select a Date.")
            return
        }
        if (formData.category === "OPTIONS" && (!formData.strike || !formData.expiryDate)) {
            toast.warning("Strike price and Expiry Date are mandatory for Options.")
            return
        }

        setLoading(true)

        try {
            const entry = parseFloat(formData.entryPrice)
            const exit = formData.exitPrice ? parseFloat(formData.exitPrice) : 0
            const qty = parseFloat(formData.quantity)

            // Calculate Taxes
            const taxResult = calculateIntradayCharges(entry, exit, qty, formData.type)

            // Create Payload
            const payload = {
                ...formData,
                exitPrice: formData.exitPrice || null, // Safely handle open trades
                strike: formData.category === "OPTIONS" && formData.strike ? parseFloat(formData.strike) : null,
                optionType: formData.category === "OPTIONS" ? formData.optionType : null,
                expiryDate: formData.category === "OPTIONS" ? formData.expiryDate : null,
                exitDate: formData.category === "DELIVERY" && formData.exitPrice ? formData.exitDate : null,
                fees: taxResult.totalCharges || 0,
                netPnl: formData.exitPrice ? taxResult.netPnl : 0,
                id: initialData?.id
            }

            let result = initialData?.id ? await updateTrade(payload) : await createTrade(payload)

            if (result.success) {
                if (formData.exitPrice) {
                    const pnlFormatted = taxResult.netPnl.toFixed(2)
                    const pnlSign = taxResult.netPnl >= 0 ? "+" : ""
                    toast.success(initialData ? "Trade Updated" : `Trade Logged! Net P&L: ₹${pnlSign}${pnlFormatted}`)
                } else {
                    toast.success(initialData ? "Trade Updated" : "Open Trade Logged!")
                }

                if (onSuccess) {
                    onSuccess()
                } else {
                    setFormData({
                        symbol: "", category: "INTRADAY", type: "BUY", optionType: "CE", strike: "", expiryDate: "", exitDate: "",
                        entryPrice: "", exitPrice: "", quantity: "", stopLoss: "", date: new Date().toISOString().split('T')[0], notes: ""
                    })
                }
            } else {
                toast.error(result.error || "Failed to save trade")
            }
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const labelClasses = "text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1"
    const inputClasses = "w-full h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"

    return (
        <form onSubmit={handleSubmit} className="space-y-5 py-4">

            {/* CONDITIONAL UI: Category Selector (Only show for new trades) */}
            {!initialData?.id && (
                <div className="w-full flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-2">
                    {(["INTRADAY", "OPTIONS", "DELIVERY"] as const).map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all ${formData.category === cat
                                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10'
                                    : 'text-zinc-500 hover:text-foreground'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                <Label className={labelClasses}>Symbol</Label>
                <Input name="symbol" value={formData.symbol} onChange={handleChange} className={`${inputClasses} uppercase font-semibold`} placeholder="e.g. NIFTY" />
            </div>

            <div className="space-y-2">
                <Label className={labelClasses}>Type</Label>
                <Select value={formData.type} onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}>
                    <SelectTrigger className={inputClasses}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BUY" className="text-green-500 font-medium">BUY (Long)</SelectItem>
                        <SelectItem value="SELL" className="text-red-500 font-medium">SELL (Short)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 4. CONDITIONAL UI: Options */}
            {formData.category === "OPTIONS" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <Label className={labelClasses}>Option Type</Label>
                        <Select value={formData.optionType} onValueChange={(val: any) => setFormData(prev => ({ ...prev, optionType: val }))}>
                            <SelectTrigger className={inputClasses}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CE">CE (Call)</SelectItem>
                                <SelectItem value="PE">PE (Put)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className={labelClasses}>Strike</Label>
                        <Input type="number" step="0.05" name="strike" value={formData.strike} onChange={handleChange} className={inputClasses} placeholder="e.g. 22000" />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label className={labelClasses}>Expiry Date</Label>
                        <Input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className={labelClasses}>Entry Price</Label>
                    <Input type="number" step="0.05" name="entryPrice" value={formData.entryPrice} onChange={handleChange} placeholder="0.00" className={inputClasses} />
                </div>
                <div className="space-y-2">
                    <Label className={labelClasses}>Exit Price</Label>
                    <Input type="number" step="0.05" name="exitPrice" value={formData.exitPrice} onChange={handleChange} placeholder="0.00" className={inputClasses} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className={labelClasses}>Quantity</Label>
                    <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className={inputClasses} placeholder="Qty" />
                </div>
                <div className="space-y-2">
                    <Label className={labelClasses}>Stop Loss</Label>
                    <Input type="number" step="0.05" name="stopLoss" value={formData.stopLoss} onChange={handleChange} className={inputClasses} placeholder="Optional" />
                </div>
            </div>

            <div className={formData.category === "DELIVERY" && formData.exitPrice ? "grid grid-cols-2 gap-4" : "space-y-2"}>
                <div className="space-y-2">
                    <Label className={labelClasses}>{formData.category === "DELIVERY" ? "Entry Date" : "Date"}</Label>
                    <Input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClasses} />
                </div>

                {/* 5. CONDITIONAL UI: Delivery Exit Date */}
                {formData.category === "DELIVERY" && formData.exitPrice && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className={labelClasses}>Exit Date</Label>
                        <Input type="date" name="exitDate" value={formData.exitDate} onChange={handleChange} className={inputClasses} />
                    </div>
                )}
            </div>

            {/* 6. NEW UI: Notes */}
            <div className="space-y-2">
                <Label className={labelClasses}>Notes & Strategy</Label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 rounded-xl transition-all p-3 text-sm min-h-[80px] resize-none"
                    placeholder="Why did you take this trade?"
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Trade" : "Save Trade"}
            </Button>
        </form>
    )
}