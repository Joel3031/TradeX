"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/use-media-query"
import { createTrade, updateTrade, deleteTrade } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, AlertTriangle, ArrowLeft } from "lucide-react"
import { calculateIntradayCharges } from "@/lib/tax-calculator"

interface TradeDialogProps {
    trigger?: React.ReactNode
    tradeToEdit?: any
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function TradeDialog({ trigger, tradeToEdit, open: controlledOpen, onOpenChange }: TradeDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen
    const setIsOpen = onOpenChange || setInternalOpen

    const DefaultTrigger = (
        <Button className="group flex items-center !p-0 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all duration-300 ease-in-out overflow-hidden">
            {/* Fixed-size container guarantees the icon is 100% centered when collapsed */}
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
                <Plus className="h-5 w-5" />
            </div>

            {/* Text expands outward on hover */}
            <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-[100px] group-hover:opacity-100 group-hover:pr-5 font-medium">
                Add Trade
            </span>
        </Button>
    )

    const dialogContent = (
        <>
            <DialogHeader>
                <DialogTitle>{tradeToEdit ? "Edit Trade" : "Log New Trade"}</DialogTitle>
                <DialogDescription>
                    {tradeToEdit ? "Update or delete this trade record." : "Enter the details of your execution here."}
                </DialogDescription>
            </DialogHeader>
            <TradeForm setOpen={setIsOpen} initialData={tradeToEdit} />
        </>
    )

    const drawerContent = (
        <>
            <DrawerHeader className="text-left pb-0">
                <DrawerTitle>{tradeToEdit ? "Edit Trade" : "Log New Trade"}</DrawerTitle>
                <DrawerDescription>
                    {tradeToEdit ? "Update or delete this trade record." : "Enter the details of your execution here."}
                </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-8 overflow-y-auto max-h-[75vh]">
                <TradeForm setOpen={setIsOpen} className="pt-4" initialData={tradeToEdit} />
            </div>
        </>
    )

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {!isControlled && (
                    <DialogTrigger asChild>
                        {trigger || DefaultTrigger}
                    </DialogTrigger>
                )}
                <DialogContent className="sm:max-w-[500px]">
                    {dialogContent}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            {!isControlled && (
                <DrawerTrigger asChild>
                    {trigger || DefaultTrigger}
                </DrawerTrigger>
            )}
            <DrawerContent className="bg-background text-foreground border-t border-border h-auto max-h-[90vh] flex flex-col">
                {drawerContent}
            </DrawerContent>
        </Drawer>
    )
}

function TradeForm({ setOpen, className, initialData }: { setOpen: (open: boolean) => void, className?: string, initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

    // State to handle conditional rendering
    const [category, setCategory] = useState(initialData?.category || "INTRADAY")
    const [hasExitPrice, setHasExitPrice] = useState(!!initialData?.exitPrice)

    const defaultDate = initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : initialData?.entryDate
            ? new Date(initialData.entryDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

    const defaultExpiry = initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : ""
    const defaultExitDate = initialData?.exitDate ? new Date(initialData.exitDate).toISOString().split('T')[0] : ""

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        const target = event.target as typeof event.target & Record<string, { value: string }>

        // 1. Safely parse numbers
        const entry = parseFloat(target.entryPrice.value.replace(/,/g, '')) || 0;
        const exit = target.exitPrice?.value ? parseFloat(target.exitPrice.value.replace(/,/g, '')) : null;
        const qty = Math.abs(parseFloat(target.quantity.value.replace(/,/g, ''))) || 0;
        const type = target.type.value || "BUY";

        // 2. Calculate the taxes (TypeScript now knows exactly what this returns)
        const taxResult = calculateIntradayCharges(entry, exit || 0, qty, type as "BUY" | "SELL");

        // Use ONLY the properties that exist in your TaxResult interface
        const calculatedFee = taxResult.totalCharges || 0;
        const calculatedNetPnl = taxResult.netPnl || 0;

        // 3. Build the payload with the new fields
        const formData = {
            symbol: target.symbol.value,
            category: category,
            type: type,
            entryPrice: entry,
            exitPrice: exit,
            quantity: qty,
            stopLoss: target.stopLoss.value ? parseFloat(target.stopLoss.value.replace(/,/g, '')) : 0,
            date: target.date.value,
            // Pass the safely extracted number to the fees property
            fees: calculatedFee,
            netPnl: exit !== null ? calculatedNetPnl : 0,
            // ... (rest of your fields)

            // New Fields mapped conditionally
            optionType: category === "OPTIONS" ? target.optionType?.value : null,
            strike: category === "OPTIONS" && target.strike?.value ? parseFloat(target.strike.value) : null,
            expiryDate: category === "OPTIONS" ? target.expiryDate?.value : null,
            exitDate: category === "DELIVERY" && exit !== null ? target.exitDate?.value : null,
            notes: target.notes?.value || null,

            id: initialData?.id
        }

        let result = initialData?.id ? await updateTrade(formData) : await createTrade(formData)

        if (result.success) {
            toast.success(initialData ? "Trade updated" : "Trade logged")
            setOpen(false)
        } else {
            toast.error(result.error || "Operation failed")
        }
        setIsLoading(false)
    }

    async function confirmDelete() {
        if (!initialData?.id) return
        setIsDeleting(true)
        const result = await deleteTrade(initialData.id)
        if (result.success) {
            toast.success("Trade deleted")
            setOpen(false)
        } else {
            toast.error(result.error || "Failed to delete")
            setIsDeleting(false)
        }
    }

    if (isConfirmingDelete) {
        return (
            <div className={`flex flex-col items-center justify-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div className="text-center space-y-2 px-4">
                    <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete this trade log? This action cannot be undone.</p>
                </div>
                <div className="flex gap-3 w-full pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting} className="flex-1 h-11"><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button>
                    <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="flex-1 h-11">{isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Delete</Button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} className={`flex flex-col gap-4 md:grid md:grid-cols-2 items-start ${className}`}>

            {/* CONDITIONAL UI: Category Selector (Only show for new trades) */}
            {!initialData?.id && (
                <div className="w-full grid gap-2 md:col-span-2 mb-2 bg-muted/40 p-1 rounded-lg border border-border/50 flex flex-row">
                    {(["INTRADAY", "OPTIONS", "DELIVERY"] as const).map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`flex-1 text-xs md:text-sm font-medium py-2 rounded-md transition-all ${category === cat ? 'bg-background shadow-sm ring-1 ring-border text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="w-full grid gap-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" name="symbol" placeholder="e.g. NIFTY" required autoFocus defaultValue={initialData?.symbol} />
            </div>

            <div className="w-full grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={initialData?.type || "BUY"}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BUY">BUY (Long)</SelectItem>
                        <SelectItem value="SELL">SELL (Short)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* CONDITIONAL: Options Fields */}
            {category === "OPTIONS" && (
                <>
                    <div className="w-full grid gap-2">
                        <Label htmlFor="optionType">Option Type</Label>
                        <Select name="optionType" defaultValue={initialData?.optionType || "CE"}>
                            <SelectTrigger><SelectValue placeholder="CE / PE" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CE">CE (Call)</SelectItem>
                                <SelectItem value="PE">PE (Put)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full grid gap-2">
                        <Label htmlFor="strike">Strike Price</Label>
                        <Input id="strike" name="strike" type="number" step="0.05" placeholder="e.g. 22000" defaultValue={initialData?.strike} required />
                    </div>
                    <div className="w-full grid gap-2 md:col-span-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input id="expiryDate" name="expiryDate" type="date" defaultValue={defaultExpiry} required />
                    </div>
                </>
            )}

            <div className="w-full grid gap-2">
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input id="entryPrice" name="entryPrice" type="number" step="0.05" placeholder="0.00" required defaultValue={initialData?.entryPrice} />
            </div>
            <div className="w-full grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" placeholder="0" required defaultValue={initialData?.quantity} />
            </div>

            <div className="w-full grid gap-2">
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input id="stopLoss" name="stopLoss" type="number" step="0.05" placeholder="Optional" defaultValue={initialData?.stopLoss} />
            </div>
            <div className="w-full grid gap-2">
                <Label htmlFor="exitPrice">Exit Price</Label>
                <Input
                    id="exitPrice"
                    name="exitPrice"
                    type="number"
                    step="0.05"
                    placeholder="Target hit?"
                    defaultValue={initialData?.exitPrice}
                    onChange={(e) => setHasExitPrice(!!e.target.value)}
                />
            </div>

            <div className={category === "DELIVERY" && hasExitPrice ? "w-full grid gap-2" : "w-full grid gap-2 md:col-span-2"}>
                <Label htmlFor="date">{category === "DELIVERY" ? "Entry Date" : "Date"}</Label>
                <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
            </div>

            {/* CONDITIONAL: Delivery Exit Date */}
            {category === "DELIVERY" && hasExitPrice && (
                <div className="w-full grid gap-2">
                    <Label htmlFor="exitDate">Exit Date</Label>
                    <Input id="exitDate" name="exitDate" type="date" defaultValue={defaultExitDate} required />
                </div>
            )}

            {/* NEW: Notes Field */}
            <div className="w-full grid gap-2 md:col-span-2">
                <Label htmlFor="notes">Notes & Strategy</Label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Why did you take this trade?"
                    defaultValue={initialData?.notes}
                />
            </div>

            <div className="flex gap-3 w-full md:col-span-2 mt-4 mb-2">
                <Button type="submit" disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-md">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Trade" : "Save Trade"}
                </Button>
                {initialData && (
                    <Button type="button" variant="destructive" onClick={() => setIsConfirmingDelete(true)} disabled={isLoading} className="h-12 w-12 px-0 shadow-md">
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </form>
    )
}