"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTrade, updateTrade } from "@/app/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
        setLoading(true)

        try {
            let result;

            if (initialData?.id) {
                // FIX: Combine ID and formData into a single object
                result = await updateTrade({ ...formData, id: initialData.id })
            } else {
                result = await createTrade(formData)
            }

            if (result.success) {
                toast.success(initialData ? "Trade Updated" : "Trade Logged Successfully")
                // Close dialog / refresh list
                if (onSuccess) {
                    onSuccess()
                } else {
                    // Reset form only if not closing (though usually you close on success)
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">

            {/* 1. SYMBOL (Full Width) */}
            <div className="space-y-2">
                <Label>Symbol</Label>
                <Input name="symbol" value={formData.symbol} onChange={handleChange} required className="uppercase" placeholder="NIFTY" />
            </div>

            {/* 2. TYPE (Full Width) */}
            <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 3. ENTRY PRICE & EXIT PRICE (Side-by-Side) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Entry Price</Label>
                    <Input type="number" step="0.05" name="entryPrice" value={formData.entryPrice} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label>Exit Price</Label> {/* Removed (Optional) */}
                    <Input type="number" step="0.05" name="exitPrice" value={formData.exitPrice} onChange={handleChange} placeholder="Target?" />
                </div>
            </div>

            {/* 4. QUANTITY & STOP LOSS (Side-by-Side) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label>Stop Loss</Label>
                    <Input type="number" step="0.05" name="stopLoss" value={formData.stopLoss} onChange={handleChange} required />
                </div>
            </div>

            {/* 5. DATE (Full Width) */}
            <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Trade" : "Save Trade"}
            </Button>
        </form>
    )
}