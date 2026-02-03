"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { TradeData } from "@/components/add-trade-form"

interface TradeDetailDialogProps {
    trade: TradeData | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TradeDetailDialog({ trade, open, onOpenChange }: TradeDetailDialogProps) {
    if (!trade) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] max-w-md rounded-xl">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-4">
                        <DialogTitle className="text-2xl font-bold">{trade.symbol}</DialogTitle>
                        <Badge variant={trade.type === "BUY" ? "default" : "destructive"}>
                            {trade.type}
                        </Badge>
                    </div>
                    <DialogDescription>
                        {format(new Date(trade.date), "PPP")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Entry Price</span>
                        <p className="font-mono font-medium">{trade.entryPrice}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Quantity</span>
                        <p className="font-mono font-medium">{trade.quantity}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Stop Loss</span>
                        <p className="font-mono text-red-500">{trade.stopLoss}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Exit Price</span>
                        <p className="font-mono">{trade.exitPrice || "-"}</p>
                    </div>
                    <div className="space-y-1 col-span-2 border-t pt-2 mt-2">
                        <span className="text-muted-foreground">Net P/L</span>
                        {/* Calculate P/L for display if not stored in the trade object directly for this view */}
                        <p className={`text-xl font-bold ${
                            // Simple check based on stored string/number
                            Number(trade.exitPrice) > 0
                                ? (trade.type === "BUY" && Number(trade.exitPrice) > Number(trade.entryPrice)) || (trade.type === "SELL" && Number(trade.exitPrice) < Number(trade.entryPrice))
                                    ? "text-green-500"
                                    : "text-red-500"
                                : "text-muted-foreground"
                            }`}>
                            {/* Note: In a real app, pass the pre-calculated PnL */}
                            {trade.exitPrice ? "Closed" : "Open"}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}