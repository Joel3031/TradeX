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

export interface TradeData {
    id?: string
    symbol: string
    type: "BUY" | "SELL"
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

    const [formData, setFormData] = useState<TradeData>({
        symbol: initialData?.symbol || "",
        type: initialData?.type || "BUY",
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
        if (!formData.entryPrice || !formData.exitPrice) {
            toast.warning("Entry Price and Exit Price are mandatory.")
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

        setLoading(true)

        try {
            // 1. Convert inputs to numbers
            const entry = parseFloat(formData.entryPrice)
            const exit = parseFloat(formData.exitPrice)
            const qty = parseFloat(formData.quantity)

            // 2. Calculate Taxes & Net PnL locally
            const taxResult = calculateIntradayCharges(entry, exit, qty, formData.type)

            // 3. Create Payload
            // Explicitly adding fees and netPnl to the object sent to the server
            const payload = {
                ...formData,
                fees: taxResult.totalCharges,
                netPnl: taxResult.netPnl,
                id: initialData?.id
            }

            let result;

            if (initialData?.id) {
                result = await updateTrade(payload)
            } else {
                result = await createTrade(payload)
            }

            if (result.success) {
                const pnlFormatted = taxResult.netPnl.toFixed(2)
                const pnlSign = taxResult.netPnl >= 0 ? "+" : ""

                toast.success(
                    initialData
                        ? "Trade Updated"
                        : `Trade Logged! Net P&L: ₹${pnlSign}${pnlFormatted}`
                )

                if (onSuccess) {
                    onSuccess()
                } else {
                    setFormData({
                        symbol: "", type: "BUY", entryPrice: "", exitPrice: "",
                        quantity: "", stopLoss: "", date: new Date().toISOString().split('T')[0]
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const labelClasses = "text-xs font-medium uppercase text-zinc-500 tracking-wider ml-1"
    const inputClasses = "w-full h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"

    return (
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
                <Label className={labelClasses}>Symbol</Label>
                <Input
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleChange}
                    className={`${inputClasses} uppercase font-semibold`}
                    placeholder="e.g. NIFTY"
                />
            </div>

            <div className="space-y-2">
                <Label className={labelClasses}>Type</Label>
                <Select value={formData.type} onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}>
                    <SelectTrigger className={inputClasses}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BUY" className="text-green-500 font-medium">BUY (Long)</SelectItem>
                        <SelectItem value="SELL" className="text-red-500 font-medium">SELL (Short)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className={labelClasses}>Entry Price</Label>
                    <Input
                        type="number"
                        step="0.05"
                        name="entryPrice"
                        value={formData.entryPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={inputClasses}
                    />
                </div>
                <div className="space-y-2">
                    <Label className={labelClasses}>Exit Price</Label>
                    <Input
                        type="number"
                        step="0.05"
                        name="exitPrice"
                        value={formData.exitPrice}
                        onChange={handleChange}
                        placeholder="Target"
                        className={inputClasses}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className={labelClasses}>Quantity</Label>
                    <Input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Qty"
                    />
                </div>
                <div className="space-y-2">
                    <Label className={labelClasses}>Stop Loss</Label>
                    <Input
                        type="number"
                        step="0.05"
                        name="stopLoss"
                        value={formData.stopLoss}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Optional"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className={labelClasses}>Date</Label>
                <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClasses}
                />
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Trade" : "Save Trade"}
            </Button>
        </form>
    )
}