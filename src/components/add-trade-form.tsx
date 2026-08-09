"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createTrade, updateTrade } from "@/app/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { calculateIntradayCharges } from "@/lib/tax-calculator"

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
    isQuickLog?: boolean
    quickPnl?: string
}

interface TradeFormProps {
    initialData?: TradeData
    onSuccess?: () => void
}

export function TradeForm({ initialData, onSuccess }: TradeFormProps) {
    const [loading, setLoading] = useState(false)
    const [isQuickLogMode, setIsQuickLogMode] = useState(initialData?.isQuickLog || false)

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
        notes: initialData?.notes || "",
        isQuickLog: initialData?.isQuickLog || false,
        quickPnl: initialData?.netPnl?.toString() || ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.symbol) {
            toast.warning("Please enter a Symbol (e.g., NIFTY)")
            return
        }
        if (!formData.date) {
            toast.warning("Please select a Date.")
            return
        }

        // Validation for Detailed Mode
        if (!isQuickLogMode) {
            if (!formData.entryPrice) {
                toast.warning("Entry Price is mandatory.")
                return
            }
            if (!formData.quantity) {
                toast.warning("Please enter the Quantity.")
                return
            }
            if (formData.category === "OPTIONS" && (!formData.strike || !formData.expiryDate)) {
                toast.warning("Strike price and Expiry Date are mandatory for Options.")
                return
            }
        } else {
            // Validation for Quick Mode
            if (!formData.quickPnl) {
                toast.warning("Please enter Profit/Loss amount.")
                return
            }
        }

        setLoading(true)

        try {
            let payload: any = {}

            if (isQuickLogMode) {
                const manualPnl = parseFloat(formData.quickPnl || "0")
                payload = {
                    symbol: formData.symbol,
                    category: formData.category, // Now uses the selected category
                    type: formData.type,
                    entryPrice: 0,
                    exitPrice: 0,
                    quantity: 0,
                    stopLoss: null,
                    date: formData.date,
                    notes: formData.notes || "Quick Logged Trade",
                    fees: 0,
                    netPnl: manualPnl,
                    pnl: manualPnl,
                    id: initialData?.id
                }
            } else {
                const entry = parseFloat(formData.entryPrice)
                const exit = formData.exitPrice ? parseFloat(formData.exitPrice) : 0
                const qty = parseFloat(formData.quantity)

                const taxResult = calculateIntradayCharges(entry, exit, qty, formData.type)

                payload = {
                    ...formData,
                    exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
                    strike: formData.category === "OPTIONS" && formData.strike ? parseFloat(formData.strike) : null,
                    optionType: formData.category === "OPTIONS" ? formData.optionType : null,
                    expiryDate: formData.category === "OPTIONS" ? formData.expiryDate : null,
                    exitDate: formData.category === "DELIVERY" && formData.exitPrice ? formData.exitDate : null,
                    fees: taxResult.totalCharges || 0,
                    netPnl: formData.exitPrice ? taxResult.netPnl : 0,
                    pnl: taxResult.grossPnl || 0,
                    id: initialData?.id
                }

                delete payload.isQuickLog
                delete payload.quickPnl
            }

            let result = initialData?.id ? await updateTrade(payload) : await createTrade(payload)

            if (result.success) {
                if (isQuickLogMode || formData.exitPrice) {
                    const finalPnl = isQuickLogMode ? parseFloat(formData.quickPnl!) : payload.netPnl
                    const pnlFormatted = finalPnl.toFixed(2)
                    const pnlSign = finalPnl >= 0 ? "+" : ""
                    toast.success(initialData ? "Trade Updated" : `Trade Logged! Net P&L: ₹${pnlSign}${pnlFormatted}`)
                } else {
                    toast.success(initialData ? "Trade Updated" : "Open Trade Logged!")
                }

                if (onSuccess) {
                    onSuccess()
                } else {
                    setFormData({
                        symbol: "", category: "INTRADAY", type: "BUY", optionType: "CE", strike: "", expiryDate: "", exitDate: "",
                        entryPrice: "", exitPrice: "", quantity: "", stopLoss: "", date: new Date().toISOString().split('T')[0], notes: "",
                        isQuickLog: false, quickPnl: ""
                    })
                    setIsQuickLogMode(false)
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

            {/* QUICK LOG TOGGLE */}
            <div className="flex items-center justify-between p-4 bg-muted/40 border border-border/50 rounded-xl mb-2">
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">Quick Log</span>
                    <span className="text-xs text-muted-foreground">Only enter symbol and P&L</span>
                </div>
                <Switch
                    checked={isQuickLogMode}
                    onCheckedChange={(val) => {
                        setIsQuickLogMode(val)
                        setFormData(prev => ({ ...prev, isQuickLog: val }))
                    }}
                />
            </div>

            {/* CATEGORY SELECTOR (Now shows in both modes for new trades) */}
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

            {isQuickLogMode ? (
                /* QUICK LOG UI */
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    <div className="space-y-2">
                        <Label className={labelClasses}>Buy/Sell</Label>
                        <Select value={formData.type} onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}>
                            <SelectTrigger className={inputClasses}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BUY" className="text-green-500 font-medium">BUY (Long)</SelectItem>
                                <SelectItem value="SELL" className="text-red-500 font-medium">SELL (Short)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className={labelClasses}>Net P&L (₹)</Label>
                            <Input
                                type="number"
                                step="0.05"
                                name="quickPnl"
                                value={formData.quickPnl}
                                onChange={handleChange}
                                placeholder="-1500 or 2000"
                                className={`${inputClasses} ${Number(formData.quickPnl) > 0 ? 'text-green-500' : Number(formData.quickPnl) < 0 ? 'text-red-500' : ''}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClasses}>Date</Label>
                            <Input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>
                </div>
            ) : (
                /* DETAILED LOG UI */
                <div className="space-y-5 animate-in fade-in duration-300">
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

                        {formData.category === "DELIVERY" && formData.exitPrice && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className={labelClasses}>Exit Date</Label>
                                <Input type="date" name="exitDate" value={formData.exitDate} onChange={handleChange} className={inputClasses} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SHARED UI: Notes */}
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